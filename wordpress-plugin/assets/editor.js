( function ( wp ) {
	'use strict';

	if ( ! wp || ! wp.element || ! wp.plugins || ! wp.blocks || ! wp.data || ! wp.apiFetch ) {
		return;
	}

	var h = wp.element.createElement;
	var memo = wp.element.memo || function ( component ) {
		return component;
	};
	var useEffect = wp.element.useEffect;
	var useMemo = wp.element.useMemo;
	var useRef = wp.element.useRef;
	var useState = wp.element.useState;
	var registerPlugin = wp.plugins.registerPlugin;
	var PluginSidebar = ( wp.editor && wp.editor.PluginSidebar ) || ( wp.editPost && wp.editPost.PluginSidebar );
	var createBlock = wp.blocks.createBlock;
	var dispatch = wp.data.dispatch;
	var apiFetch = wp.apiFetch;
	var config = window.IconSearchWordPress || {};
	var restPath = config.restPath || '/iconsearch/v1';
	var serviceBase = String( config.homepage || 'https://iconsearch.info' ).replace( /\/+$/, '' );
	var dragMimeType = 'application/x-iconsearch-icon';
	var svgCache = new Map();

	if ( ! PluginSidebar ) {
		return;
	}

	if ( config.nonce && apiFetch.createNonceMiddleware ) {
		apiFetch.use( apiFetch.createNonceMiddleware( config.nonce ) );
	}

	var LIBRARIES = [
		{ value: 'all', label: 'All libraries' },
		{ value: 'lucide-icons', label: 'Lucide' },
		{ value: 'heroicons', label: 'Heroicons' },
		{ value: 'tabler-icons', label: 'Tabler' },
		{ value: 'patternfly-icons', label: 'PatternFly' },
		{ value: 'untitled-ui-icons', label: 'Untitled UI' },
		{ value: 'phosphor-icons', label: 'Phosphor' },
		{ value: 'remix-icon', label: 'Remix' },
		{ value: 'bootstrap-icons', label: 'Bootstrap' },
		{ value: 'radix-icons', label: 'Radix' },
		{ value: 'iconoir', label: 'Iconoir' },
		{ value: 'ionicons', label: 'Ionicons' },
		{ value: 'octicons', label: 'Octicons' },
		{ value: 'ant-design-icons', label: 'Ant Design' },
		{ value: 'iconify', label: 'Iconify collections' },
	];

	var STYLES = [
		{ value: 'all', label: 'All styles' },
		{ value: 'stroke', label: 'Outline' },
		{ value: 'solid', label: 'Solid' },
		{ value: 'duotone', label: 'Duotone' },
		{ value: 'twotone', label: 'Two-tone' },
		{ value: 'sharp', label: 'Sharp' },
	];

	var SIZE_PRESETS = [ 24, 32, 48, 64, 96 ];
	var COLOR_PRESETS = [ '#111827', '#2563eb', '#7c3aed', '#e11d48', '#ea580c', '#16a34a' ];
	var ICONS_PER_PAGE = 120;

	function request( path, options ) {
		return apiFetch( Object.assign( { path: restPath + path }, options || {} ) );
	}

	function delay( milliseconds ) {
		return new Promise( function ( resolve ) {
			window.setTimeout( resolve, milliseconds );
		} );
	}

	function clamp( value, minimum, maximum ) {
		return Math.max( minimum, Math.min( maximum, value ) );
	}

	function normalizeColor( value ) {
		var color = String( value || '' ).trim();
		return /^#[0-9a-f]{6}$/i.test( color ) ? color : '#111827';
	}

	function displayName( icon ) {
		return icon.displayName || icon.name || 'Icon';
	}

	function normalizeIcon( value ) {
		if ( ! value || typeof value !== 'object' ) return null;
		var name = String( value.name || '' ).trim();
		var library = String( value.library || '' ).trim();
		if ( ! name || ! library ) return null;

		return {
			id: String( value.id || library + '-' + name ),
			name: name,
			displayName: String( value.displayName || name ),
			library: library,
			libraryName: String( value.libraryName || library ),
			license: String( value.license || 'License unavailable' ),
			legalSafe: value.legalSafe === true,
			svgUrl: String( value.svgUrl || '' ),
		};
	}

	function previewUrl( icon ) {
		var value = String( icon && icon.svgUrl ? icon.svgUrl : '' ).trim();
		if ( ! value ) return '';
		if ( value.indexOf( '//' ) === 0 ) return 'https:' + value;
		if ( value.charAt( 0 ) === '/' ) return serviceBase + value;
		return /^https:\/\//i.test( value ) ? value : '';
	}

	function maskStyle( icon, color, size ) {
		var url = previewUrl( icon ).replace( /"/g, '%22' );
		return {
			width: size + 'px',
			height: size + 'px',
			backgroundColor: normalizeColor( color ),
			WebkitMask: 'url("' + url + '") no-repeat center / contain',
			mask: 'url("' + url + '") no-repeat center / contain',
		};
	}

	function escapeComment( value ) {
		return String( value || '' ).replace( /--/g, '' );
	}

	function shouldReplacePaint( value ) {
		var paint = String( value || '' ).trim().toLowerCase();
		return Boolean(
			paint &&
			paint !== 'none' &&
			paint !== 'transparent' &&
			paint.indexOf( 'url(' ) !== 0 &&
			paint.indexOf( 'var(' ) !== 0 &&
			paint.indexOf( 'context-' ) !== 0
		);
	}

	function prepareSvg( svg, icon, settings ) {
		var documentNode = new window.DOMParser().parseFromString( String( svg || '' ), 'image/svg+xml' );
		var root = documentNode.documentElement;
		if ( ! root || root.localName !== 'svg' || documentNode.querySelector( 'parsererror' ) ) {
			throw new Error( 'The selected icon did not return valid SVG markup.' );
		}

		documentNode
			.querySelectorAll( 'script,foreignObject,iframe,object,embed,style,image,audio,video,base' )
			.forEach( function ( node ) {
				node.remove();
			} );

		documentNode.querySelectorAll( '*' ).forEach( function ( node ) {
			Array.prototype.slice.call( node.attributes || [] ).forEach( function ( attribute ) {
				var name = attribute.name.toLowerCase();
				var value = attribute.value.trim();
				if (
					name.indexOf( 'on' ) === 0 ||
					name === 'style' ||
					( ( name === 'href' || name === 'xlink:href' ) && value.indexOf( '#' ) !== 0 )
				) {
					node.removeAttribute( attribute.name );
				}
			} );
		} );

		var size = clamp( Math.round( Number( settings.size ) || 48 ), 8, 512 );
		var color = normalizeColor( settings.color );
		var hasPaint = false;

		documentNode.querySelectorAll( '[fill],[stroke]' ).forEach( function ( node ) {
			[ 'fill', 'stroke' ].forEach( function ( attribute ) {
				var value = node.getAttribute( attribute );
				if ( shouldReplacePaint( value ) ) {
					node.setAttribute( attribute, color );
					hasPaint = true;
				}
			} );
		} );

		root.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
		root.setAttribute( 'width', String( size ) );
		root.setAttribute( 'height', String( size ) );
		root.setAttribute( 'color', color );
		root.setAttribute( 'role', 'img' );
		root.setAttribute( 'aria-label', displayName( icon ) );
		root.setAttribute( 'focusable', 'false' );
		root.setAttribute( 'class', 'iconsearch-inline-svg' );
		root.setAttribute(
			'style',
			'display:inline-block;width:' +
				size +
				'px;height:' +
				size +
				'px;vertical-align:-0.125em;color:' +
				color +
				';'
		);

		if ( ! hasPaint && ! root.hasAttribute( 'fill' ) ) {
			root.setAttribute( 'fill', color );
		}

		return new window.XMLSerializer().serializeToString( root );
	}

	function fetchSvg( icon ) {
		var cacheKey = icon.library + ':' + icon.name;
		if ( svgCache.has( cacheKey ) ) {
			return svgCache.get( cacheKey );
		}

		var promise = request(
			'/svg?library=' +
				encodeURIComponent( icon.library ) +
				'&name=' +
				encodeURIComponent( icon.name )
		)
			.then( function ( payload ) {
				if ( ! payload || typeof payload.svg !== 'string' || payload.svg.indexOf( '<svg' ) === -1 ) {
					throw new Error( 'IconSearch did not return SVG markup.' );
				}
				return payload.svg;
			} )
			.catch( function ( error ) {
				svgCache.delete( cacheKey );
				throw error;
			} );

		svgCache.set( cacheKey, promise );
		while ( svgCache.size > 80 ) {
			svgCache.delete( svgCache.keys().next().value );
		}

		return promise;
	}

	function createIconBlock( icon, settings ) {
		return fetchSvg( icon ).then( function ( svg ) {
			var prepared = prepareSvg( svg, icon, settings );
			var comment =
				'<!-- IconSearch: ' +
				escapeComment( displayName( icon ) ) +
				' from ' +
				escapeComment( icon.libraryName || icon.library ) +
				' -->';
			return createBlock( 'core/html', { content: comment + '\n' + prepared } );
		} );
	}

	function insertIcon( icon, settings ) {
		return createIconBlock( icon, settings ).then( function ( block ) {
			var editorDispatch = dispatch( 'core/block-editor' );
			if ( ! editorDispatch || ! editorDispatch.insertBlocks ) {
				throw new Error( 'The WordPress block editor is not available.' );
			}
			editorDispatch.insertBlocks( block );
			return true;
		} );
	}

	function copyText( value ) {
		if ( window.navigator.clipboard && window.isSecureContext ) {
			return window.navigator.clipboard.writeText( value );
		}

		return new Promise( function ( resolve, reject ) {
			var input = document.createElement( 'textarea' );
			input.value = value;
			input.setAttribute( 'readonly', '' );
			input.style.position = 'fixed';
			input.style.opacity = '0';
			document.body.appendChild( input );
			input.select();
			var copied = document.execCommand( 'copy' );
			input.remove();
			if ( copied ) {
				resolve();
			} else {
				reject( new Error( 'Clipboard access is unavailable.' ) );
			}
		} );
	}

	function beginIconDrag( event, icon, settings ) {
		var payload = JSON.stringify( {
			icon: icon,
			settings: settings,
		} );
		event.dataTransfer.effectAllowed = 'copy';
		event.dataTransfer.setData( dragMimeType, payload );
		event.dataTransfer.setData( 'text/plain', displayName( icon ) );
		void fetchSvg( icon ).catch( function () {} );
	}

	function accountLabel( access ) {
		if ( access && access.tier === 'founder' && access.founderNumber ) {
			return 'Founder #' + access.founderNumber;
		}
		return 'Free';
	}

	function ControlLabel( props ) {
		return h( 'label', { className: 'iconsearch-control-label' }, props.children );
	}

	function IconShape( props ) {
		return h( 'span', {
			className: 'iconsearch-preview-shape',
			style: maskStyle( props.icon, props.color, props.size ),
			'aria-hidden': 'true',
		} );
	}

	function LoadingGrid() {
		return h(
			'div',
			{ className: 'iconsearch-loading-grid', 'aria-label': 'Loading icons' },
			Array.from( { length: 21 }, function ( _, index ) {
				return h(
					'div',
					{ key: index, className: 'iconsearch-skeleton-card' },
					h( 'span', { className: 'iconsearch-skeleton-preview' } )
				);
			} )
		);
	}

	function IconSearchLogo( props ) {
		var size = props && props.size ? props.size : 20;
		return h(
			'svg',
			{
				width: String( size ),
				height: String( size ),
				viewBox: '0 0 128 128',
				fill: 'none',
				xmlns: 'http://www.w3.org/2000/svg',
				style: { display: 'block', borderRadius: '4px' },
			},
			h( 'rect', { width: '128', height: '128', rx: '28', fill: 'url(#iconsearch-logo-grad)' } ),
			h( 'circle', { cx: '100', cy: '28', r: '30', fill: 'white', fillOpacity: '0.18' } ),
			h( 'path', { d: 'M32 42H44V86H32V42Z', fill: 'white' } ),
			h( 'path', {
				d: 'M55 84.5V72.8C59.8 76.2 65 77.9 70.6 77.9C74.2 77.9 77 77.3 79 76.1C81 74.9 82 73.2 82 71C82 69.1 81.2 67.6 79.7 66.5C78.2 65.4 75.5 64.3 71.6 63.1L67.1 61.8C59.2 59.4 55.2 54.8 55.2 48C55.2 42.9 57.2 39 61.3 36.2C65.4 33.4 70.7 32 77.2 32C82.9 32 87.8 32.8 92 34.5V45.7C87.7 43 82.9 41.7 77.7 41.7C74.8 41.7 72.5 42.2 70.8 43.2C69.1 44.2 68.2 45.7 68.2 47.6C68.2 49.4 69 50.8 70.5 51.8C72 52.8 74.7 53.8 78.6 55L82.4 56.2C86.8 57.6 90 59.4 92.1 61.8C94.2 64.1 95.3 67.1 95.3 70.9C95.3 76.3 93.2 80.5 89.1 83.4C85 86.3 79.2 87.8 71.7 87.8C65.4 87.8 59.8 86.7 55 84.5Z',
				fill: 'white',
			} ),
			h(
				'defs',
				null,
				h(
					'linearGradient',
					{
						id: 'iconsearch-logo-grad',
						x1: '17',
						y1: '111',
						x2: '111',
						y2: '17',
						gradientUnits: 'userSpaceOnUse',
					},
					h( 'stop', { stopColor: '#22D3EE' } ),
					h( 'stop', { offset: '0.55', stopColor: '#3B82F6' } ),
					h( 'stop', { offset: '1', stopColor: '#8B5CF6' } )
				)
			)
		);
	}

	function AuthScreen( props ) {
		return h(
			'div',
			{ className: 'iconsearch-auth' },
			h(
				'div',
				{ className: 'iconsearch-auth-mark', 'aria-hidden': 'true' },
				h( IconSearchLogo, { size: 54 } )
			),
			h( 'h2', null, 'Connect IconSearch' ),
			h(
				'p',
				null,
				'Sign in or create a free IconSearch account to search and insert icons.'
			),
			h(
				'button',
				{
					type: 'button',
					className: 'iconsearch-primary',
					onClick: props.onSignIn,
					disabled: props.connecting,
				},
				props.connecting ? 'Waiting for approval...' : 'Sign in with IconSearch'
			),
			props.verificationUrl
				? h(
						'a',
						{
							className: 'iconsearch-secondary-link',
							href: props.verificationUrl,
							target: '_blank',
							rel: 'noopener noreferrer',
						},
						'Open approval page'
				  )
				: null,
			props.message
				? h(
						'div',
						{
							className:
								'iconsearch-auth-status' +
								( props.error ? ' is-error' : '' ),
						},
						props.message
				  )
				: null,
			h(
				'p',
				{ className: 'iconsearch-service-note' },
				'Uses the IconSearch service. ',
				h(
					'a',
					{ href: config.terms, target: '_blank', rel: 'noopener noreferrer' },
					'Terms'
				),
				' · ',
				h(
					'a',
					{ href: config.privacy, target: '_blank', rel: 'noopener noreferrer' },
					'Privacy'
				)
			)
		);
	}

	function IconCardComponent( props ) {
		var iconName = displayName( props.icon );
		var libraryName = props.icon.libraryName || props.icon.library;

		return h(
			'button',
			{
				type: 'button',
				className: 'iconsearch-card' + ( props.selected ? ' is-selected' : '' ),
				draggable: true,
				onClick: function () {
					props.onSelect( props.icon );
				},
				onDoubleClick: function () {
					props.onInsert( props.icon );
				},
				onDragStart: function ( event ) {
					beginIconDrag( event, props.icon, props.settings );
				},
				'aria-label': iconName + ' from ' + libraryName,
				title:
					iconName +
					' · ' +
					libraryName +
					'\nClick to select. Double-click or drag to insert.',
			},
			h(
				'span',
				{ className: 'iconsearch-card-preview' },
				h( IconShape, {
					icon: props.icon,
					color: props.settings.color,
					size: clamp( props.settings.size, 28, 36 ),
				} )
			),
			h( 'span', { className: 'iconsearch-card-name' }, iconName ),
			h( 'span', { className: 'iconsearch-card-library' }, libraryName )
		);
	}

	var IconCard = memo( IconCardComponent, function ( previous, next ) {
		return (
			previous.icon === next.icon &&
			previous.selected === next.selected &&
			previous.settings.size === next.settings.size &&
			previous.settings.color === next.settings.color
		);
	} );

	function IconSearchSidebar() {
		var _useState = useState( 'checking' );
		var connection = _useState[ 0 ];
		var setConnection = _useState[ 1 ];
		var _useState2 = useState( null );
		var access = _useState2[ 0 ];
		var setAccess = _useState2[ 1 ];
		var _useState3 = useState( '' );
		var authMessage = _useState3[ 0 ];
		var setAuthMessage = _useState3[ 1 ];
		var _useState4 = useState( '' );
		var verificationUrl = _useState4[ 0 ];
		var setVerificationUrl = _useState4[ 1 ];
		var _useState5 = useState( 'arrow' );
		var query = _useState5[ 0 ];
		var setQuery = _useState5[ 1 ];
		var _useState6 = useState( 'all' );
		var library = _useState6[ 0 ];
		var setLibrary = _useState6[ 1 ];
		var _useState7 = useState( 'all' );
		var style = _useState7[ 0 ];
		var setStyle = _useState7[ 1 ];
		var _useState8 = useState( true );
		var legalOnly = _useState8[ 0 ];
		var setLegalOnly = _useState8[ 1 ];
		var _useState9 = useState( 48 );
		var size = _useState9[ 0 ];
		var setSize = _useState9[ 1 ];
		var _useState10 = useState( '#111827' );
		var color = _useState10[ 0 ];
		var setColor = _useState10[ 1 ];
		var _useState11 = useState( [] );
		var icons = _useState11[ 0 ];
		var setIcons = _useState11[ 1 ];
		var _useState12 = useState( 0 );
		var total = _useState12[ 0 ];
		var setTotal = _useState12[ 1 ];
		var _useState13 = useState( 1 );
		var page = _useState13[ 0 ];
		var setPage = _useState13[ 1 ];
		var _useState14 = useState( 1 );
		var totalPages = _useState14[ 0 ];
		var setTotalPages = _useState14[ 1 ];
		var _useState15 = useState( false );
		var loading = _useState15[ 0 ];
		var setLoading = _useState15[ 1 ];
		var _useState17 = useState( null );
		var selected = _useState17[ 0 ];
		var setSelected = _useState17[ 1 ];
		var _useState18 = useState( '' );
		var notice = _useState18[ 0 ];
		var setNotice = _useState18[ 1 ];
		var _useState19 = useState( '' );
		var error = _useState19[ 0 ];
		var setError = _useState19[ 1 ];
		var authAttempt = useRef( 0 );
		var searchAttempt = useRef( 0 );
		var loadingMoreRef = useRef( false );
		var selectedIcon =
			icons.find( function ( icon ) {
				return selected && icon.id === selected.id;
			} ) ||
			selected ||
			icons[ 0 ] ||
			null;
		var settings = useMemo(
			function () {
				return {
					size: clamp( Math.round( Number( size ) || 48 ), 8, 512 ),
					color: normalizeColor( color ),
				};
			},
			[ size, color ]
		);

		useEffect( function () {
			var active = true;
			request( '/session' )
				.then( function ( payload ) {
					if ( ! active ) return;
					if ( payload && payload.connected ) {
						setAccess( payload.access || null );
						setConnection( 'connected' );
					} else {
						setConnection( 'disconnected' );
					}
				} )
				.catch( function () {
					if ( active ) {
						setAuthMessage( 'Could not check the saved IconSearch session.' );
						setConnection( 'disconnected' );
					}
				} );

			return function () {
				active = false;
				authAttempt.current += 1;
			};
		}, [ setAccess, setAuthMessage, setConnection ] );

		useEffect(
			function () {
				if ( connection !== 'connected' ) return undefined;

				var attempt = ++searchAttempt.current;
				var timer = window.setTimeout( function () {
					setLoading( true );
					setError( '' );
					var parameters = new URLSearchParams( {
						q: query.trim(),
						lib: library,
						style: style,
						legalOnly: legalOnly ? '1' : '0',
						page: '1',
						limit: String( ICONS_PER_PAGE ),
						sort: query.trim() ? 'relevance' : 'popular',
					} );

					request( '/icons?' + parameters.toString() )
						.then( function ( payload ) {
							if ( attempt !== searchAttempt.current ) return;
							var nextIcons = ( Array.isArray( payload.icons ) ? payload.icons : [] )
								.map( normalizeIcon )
								.filter( Boolean );
							setIcons( nextIcons );
							setTotal( Number( payload.total ) || nextIcons.length );
							setPage( Number( payload.page ) || 1 );
							setTotalPages( Number( payload.totalPages ) || 1 );
							setSelected( function ( current ) {
								return nextIcons.find( function ( icon ) {
									return current && icon.id === current.id;
								} ) || nextIcons[ 0 ] || null;
							} );
						} )
						.catch( function ( searchError ) {
							if ( attempt !== searchAttempt.current ) return;
							if ( searchError && searchError.data && searchError.data.status === 401 ) {
								setConnection( 'disconnected' );
								setAccess( null );
								setAuthMessage( 'Your IconSearch session expired. Sign in again.' );
								return;
							}
							setError(
								searchError && searchError.message
									? searchError.message
									: 'Icon search failed.'
							);
						} )
						.finally( function () {
							if ( attempt === searchAttempt.current ) {
								setLoading( false );
							}
						} );
				}, 180 );

				return function () {
					window.clearTimeout( timer );
				};
			},
			[
				connection,
				query,
				library,
				style,
				legalOnly,
				setAccess,
				setAuthMessage,
				setConnection,
				setError,
				setIcons,
				setLoading,
				setPage,
				setSelected,
				setTotal,
				setTotalPages,
			]
		);

		useEffect(
			function () {
				function handleDragOver( event ) {
					if (
						event.dataTransfer &&
						Array.prototype.includes.call( event.dataTransfer.types || [], dragMimeType )
					) {
						event.preventDefault();
						event.dataTransfer.dropEffect = 'copy';
					}
				}

				function handleDrop( event ) {
					if (
						! event.dataTransfer ||
						! Array.prototype.includes.call( event.dataTransfer.types || [], dragMimeType )
					) {
						return;
					}

					event.preventDefault();
					event.stopPropagation();
					try {
						var payload = JSON.parse( event.dataTransfer.getData( dragMimeType ) );
						if ( payload && payload.icon ) {
							setNotice( 'Inserting ' + displayName( payload.icon ) + '...' );
							insertIcon( payload.icon, payload.settings || settings )
								.then( function () {
									setNotice( 'Icon inserted from drag.' );
								} )
								.catch( function ( dropError ) {
									setError(
										dropError && dropError.message
											? dropError.message
											: 'Could not insert the dragged icon.'
									);
								} );
						}
					} catch {
						setError( 'The dragged icon data was invalid.' );
					}
				}

				document.addEventListener( 'dragover', handleDragOver, true );
				document.addEventListener( 'drop', handleDrop, true );
				return function () {
					document.removeEventListener( 'dragover', handleDragOver, true );
					document.removeEventListener( 'drop', handleDrop, true );
				};
			},
			[ settings, setError, setNotice ]
		);

		function beginSignIn() {
			var attempt = ++authAttempt.current;
			var approvalWindow = window.open( 'about:blank', '_blank' );
			if ( approvalWindow ) {
				approvalWindow.document.title = 'Connecting IconSearch';
			}

			setConnection( 'connecting' );
			setAuthMessage( 'Starting secure sign-in...' );
			setVerificationUrl( '' );

			request( '/auth/start', { method: 'POST' } )
				.then( function ( payload ) {
					if ( attempt !== authAttempt.current ) return null;
					var deviceCode = payload.deviceCode;
					var url = payload.verificationUriComplete;
					if ( ! deviceCode || ! url ) {
						throw new Error( 'The sign-in response was incomplete.' );
					}

					setVerificationUrl( url );
					if ( approvalWindow ) {
						approvalWindow.location.replace( url );
					}
					setAuthMessage( 'Approve the connection in the browser tab.' );

					return pollSignIn(
						attempt,
						deviceCode,
						Number( payload.expiresIn ) || 1800,
						Math.max( 2, Number( payload.interval ) || 3 )
					);
				} )
				.catch( function ( signInError ) {
					if ( attempt !== authAttempt.current ) return;
					if ( approvalWindow && ! approvalWindow.closed ) {
						approvalWindow.close();
					}
					setConnection( 'disconnected' );
					setAuthMessage(
						signInError && signInError.message
							? signInError.message
							: 'Could not connect IconSearch.'
					);
				} );
		}

		function pollSignIn( attempt, deviceCode, expiresIn, interval ) {
			var deadline = Date.now() + expiresIn * 1000;

			return ( async function () {
				while ( attempt === authAttempt.current && Date.now() < deadline ) {
					await delay( interval * 1000 );
					var payload = await request( '/auth/status', {
						method: 'POST',
						data: { deviceCode: deviceCode },
					} );

					if ( payload.status === 'pending' ) continue;
					if ( payload.status === 'authorized' && payload.access ) {
						setAccess( payload.access );
						setConnection( 'connected' );
						setAuthMessage( '' );
						setVerificationUrl( '' );
						setNotice( 'IconSearch connected.' );
						setTimeout( function () {
							if ( attempt === authAttempt.current ) {
								setNotice( '' );
							}
						}, 2400 );
						return;
					}

					throw new Error( payload.error || 'The sign-in link expired. Try again.' );
				}

				throw new Error( 'The sign-in link expired. Try again.' );
			} )();
		}

		function signOut() {
			authAttempt.current += 1;
			setConnection( 'checking' );
			request( '/auth/sign-out', { method: 'POST' } )
				.catch( function () {} )
				.finally( function () {
					svgCache.clear();
					setAccess( null );
					setIcons( [] );
					setSelected( null );
					setConnection( 'disconnected' );
					setAuthMessage( 'Signed out.' );
				} );
		}

		function insertSelected( icon ) {
			var target = icon || selectedIcon;
			if ( ! target ) return;
			setError( '' );
			setNotice( 'Inserting ' + displayName( target ) + '...' );
			insertIcon( target, settings )
				.then( function () {
					setNotice( 'Inserted ' + displayName( target ) + '.' );
				} )
				.catch( function ( insertError ) {
					setNotice( '' );
					setError(
						insertError && insertError.message
							? insertError.message
							: 'Could not insert this icon.'
					);
				} );
		}

		function copySelected() {
			if ( ! selectedIcon ) return;
			setError( '' );
			setNotice( 'Preparing SVG...' );
			fetchSvg( selectedIcon )
				.then( function ( svg ) {
					return copyText( prepareSvg( svg, selectedIcon, settings ) );
				} )
				.then( function () {
					setNotice( 'Customized SVG copied.' );
				} )
				.catch( function ( copyError ) {
					setNotice( '' );
					setError(
						copyError && copyError.message
							? copyError.message
							: 'Could not copy this icon.'
					);
				} );
		}

		function loadMore() {
			if ( loading || loadingMoreRef.current || page >= totalPages ) return;
			loadingMoreRef.current = true;
			setError( '' );
			var attempt = searchAttempt.current;
			var nextPage = page + 1;
			var parameters = new URLSearchParams( {
				q: query.trim(),
				lib: library,
				style: style,
				legalOnly: legalOnly ? '1' : '0',
				page: String( nextPage ),
				limit: String( ICONS_PER_PAGE ),
				sort: query.trim() ? 'relevance' : 'popular',
			} );

			request( '/icons?' + parameters.toString() )
				.then( function ( payload ) {
					if ( attempt !== searchAttempt.current ) return;
					var additional = ( Array.isArray( payload.icons ) ? payload.icons : [] )
						.map( normalizeIcon )
						.filter( Boolean );
					setIcons( function ( current ) {
						var seen = new Set(
							current.map( function ( icon ) {
								return icon.id;
							} )
						);
						return current.concat(
							additional.filter( function ( icon ) {
								if ( seen.has( icon.id ) ) return false;
								seen.add( icon.id );
								return true;
							} )
						);
					} );
					setPage( Number( payload.page ) || nextPage );
					setTotalPages( Number( payload.totalPages ) || totalPages );
				} )
				.catch( function ( loadError ) {
					if ( attempt !== searchAttempt.current ) return;
					setError(
						loadError && loadError.message
							? loadError.message
							: 'Could not load more icons.'
					);
				} )
				.finally( function () {
					loadingMoreRef.current = false;
				} );
		}

		function handleResultsScroll( event ) {
			var resultsScroller = event.currentTarget;
			var remaining =
				resultsScroller.scrollHeight -
				resultsScroller.scrollTop -
				resultsScroller.clientHeight;

			if ( remaining <= 900 ) {
				loadMore();
			}
		}

		var content;
		if ( connection === 'checking' ) {
			content = h(
				'div',
				{ className: 'iconsearch-checking' },
				h( 'span', { className: 'iconsearch-spinner', 'aria-hidden': 'true' } ),
				h( 'strong', null, 'Checking IconSearch account' )
			);
		} else if ( connection !== 'connected' ) {
			content = h( AuthScreen, {
				onSignIn: beginSignIn,
				connecting: connection === 'connecting',
				message: authMessage,
				error: connection === 'disconnected' && Boolean( authMessage ),
				verificationUrl: verificationUrl,
			} );
		} else {
			content = h(
				'div',
				{ className: 'iconsearch-app' },
				h(
					'div',
					{ className: 'iconsearch-fixed-pane' },
				h(
					'header',
					{ className: 'iconsearch-account-bar' },
					h(
						'div',
						{ className: 'iconsearch-brand' },
						h(
							'span',
							{ className: 'iconsearch-mark', 'aria-hidden': 'true' },
							h( IconSearchLogo, { size: 32 } )
						),
						h(
							'span',
							null,
							h( 'strong', null, 'IconSearch' ),
							h( 'small', null, accountLabel( access ) )
						)
					),
					h(
						'button',
						{
							type: 'button',
							className: 'iconsearch-quiet-button',
							onClick: signOut,
							title: access && access.email ? access.email : 'Sign out',
						},
						'Sign out'
					)
				),
				h(
					'section',
					{ className: 'iconsearch-search-bar' },
					h( 'span', { className: 'dashicons dashicons-search', 'aria-hidden': 'true' } ),
					h( 'input', {
						type: 'search',
						value: query,
						placeholder: 'Search icons...',
						'aria-label': 'Search icons',
						onChange: function ( event ) {
							setQuery( event.target.value );
						},
					} ),
					loading
						? h( 'span', {
								className: 'iconsearch-inline-spinner',
								'aria-label': 'Searching',
						  } )
						: null
				),
				h(
					'section',
					{ className: 'iconsearch-filter-row' },
					h(
						ControlLabel,
						null,
						'Library',
						h(
							'select',
							{
								value: library,
								onChange: function ( event ) {
									setLibrary( event.target.value );
								},
							},
							LIBRARIES.map( function ( option ) {
								return h( 'option', { key: option.value, value: option.value }, option.label );
							} )
						)
					),
					h(
						ControlLabel,
						null,
						'Style',
						h(
							'select',
							{
								value: style,
								onChange: function ( event ) {
									setStyle( event.target.value );
								},
							},
							STYLES.map( function ( option ) {
								return h( 'option', { key: option.value, value: option.value }, option.label );
							} )
						)
					)
				),
				h(
					'label',
					{ className: 'iconsearch-license-toggle' },
					h( 'input', {
						type: 'checkbox',
						checked: legalOnly,
						onChange: function ( event ) {
							setLegalOnly( event.target.checked );
						},
					} ),
					h( 'span', null, 'Commercial-safe only' ),
					h(
						'small',
						null,
						loading ? 'Updating...' : total.toLocaleString() + ' results'
					)
				),
				selectedIcon
					? h(
							'section',
							{ className: 'iconsearch-inspector' },
							h(
								'div',
								{ className: 'iconsearch-selected' },
								h(
									'div',
									{ className: 'iconsearch-selected-preview' },
									h( IconShape, {
										icon: selectedIcon,
										color: settings.color,
										size: clamp( Math.round( settings.size * 0.8 ), 40, 88 ),
									} )
								),
								h(
									'div',
									{ className: 'iconsearch-selected-meta' },
									h( 'strong', null, displayName( selectedIcon ) ),
									h(
										'span',
										null,
										( selectedIcon.libraryName || selectedIcon.library ) +
											' · ' +
											selectedIcon.license
									)
								)
							),
							h(
								'div',
								{ className: 'iconsearch-customize-grid' },
								h(
									ControlLabel,
									null,
									'Size',
									h(
										'div',
										{ className: 'iconsearch-size-input' },
										h( 'input', {
											type: 'range',
											min: '8',
											max: '256',
											step: '1',
											value: settings.size,
											onChange: function ( event ) {
												setSize( Number( event.target.value ) );
											},
										} ),
										h( 'input', {
											type: 'number',
											min: '8',
											max: '512',
											value: settings.size,
											'aria-label': 'Icon size in pixels',
											onChange: function ( event ) {
												setSize( clamp( Number( event.target.value ) || 8, 8, 512 ) );
											},
										} ),
										h( 'span', null, 'px' )
									)
								),
								h(
									ControlLabel,
									null,
									'Color',
									h(
										'div',
										{ className: 'iconsearch-color-input' },
										h( 'input', {
											type: 'color',
											value: settings.color,
											'aria-label': 'Icon color',
											onChange: function ( event ) {
												setColor( event.target.value );
											},
										} ),
										h( 'input', {
											type: 'text',
											value: settings.color.toUpperCase(),
											maxLength: 7,
											'aria-label': 'Icon color hex value',
											onChange: function ( event ) {
												var nextColor = event.target.value;
												if ( /^#[0-9a-f]{6}$/i.test( nextColor ) ) {
													setColor( nextColor );
												}
											},
										} )
									)
								)
							),
							h(
								'div',
								{ className: 'iconsearch-presets' },
								h(
									'div',
									{ className: 'iconsearch-size-presets', 'aria-label': 'Size presets' },
									SIZE_PRESETS.map( function ( preset ) {
										return h(
											'button',
											{
												key: preset,
												type: 'button',
												className:
													'iconsearch-preset-button' +
													( settings.size === preset ? ' is-active' : '' ),
												onClick: function () {
													setSize( preset );
												},
											},
											preset
										);
									} )
								),
								h(
									'div',
									{ className: 'iconsearch-color-presets', 'aria-label': 'Color presets' },
									COLOR_PRESETS.map( function ( preset ) {
										return h( 'button', {
											key: preset,
											type: 'button',
											className:
												'iconsearch-swatch' +
												( settings.color.toLowerCase() === preset ? ' is-active' : '' ),
											style: { backgroundColor: preset },
											'aria-label': 'Use color ' + preset,
											onClick: function () {
												setColor( preset );
											},
										} );
									} )
								)
							),
							h(
								'div',
								{ className: 'iconsearch-actions' },
								h(
									'button',
									{
										type: 'button',
										className: 'iconsearch-primary',
										onClick: function () {
											insertSelected();
										},
									},
									'Insert SVG'
								),
								h(
									'button',
									{
										type: 'button',
										className: 'iconsearch-secondary',
										onClick: copySelected,
									},
									'Copy SVG'
								)
							)
					  )
					: null,
				notice ? h( 'div', { className: 'iconsearch-notice' }, notice ) : null,
				error ? h( 'div', { className: 'iconsearch-error' }, error ) : null
				),
				h(
					'div',
					{ className: 'iconsearch-results-pane' },
				h(
					'div',
					{ className: 'iconsearch-results-heading' },
					h( 'strong', null, query.trim() ? 'Search results' : 'Popular icons' ),
					h( 'span', null, 'Drag or double-click to insert' )
				),
				h(
					'div',
					{
						className: 'iconsearch-results-scroll',
						onScroll: handleResultsScroll,
					},
				loading && ! icons.length
					? h( LoadingGrid )
					: h(
							'section',
							{ className: 'iconsearch-results', 'aria-busy': loading ? 'true' : 'false' },
							icons.map( function ( icon ) {
								return h( IconCard, {
									key: icon.id,
									icon: icon,
									settings: settings,
									selected: Boolean( selectedIcon && selectedIcon.id === icon.id ),
									onSelect: setSelected,
									onInsert: insertSelected,
								} );
							} )
					  ),
				! loading && ! icons.length
					? h( 'div', { className: 'iconsearch-empty' }, 'No icons found. Try another search or filter.' )
					: null
				)
				)
			);
		}

		return h(
			PluginSidebar,
			{
				name: 'iconsearch-sidebar',
				title: 'IconSearch',
				icon: h( IconSearchLogo, { size: 20 } ),
				className: 'iconsearch-sidebar',
			},
			h( 'div', { className: 'iconsearch-panel' }, content )
		);
	}

	registerPlugin( 'iconsearch', {
		render: IconSearchSidebar,
		icon: h( IconSearchLogo, { size: 20 } ),
	} );
} )( window.wp );
