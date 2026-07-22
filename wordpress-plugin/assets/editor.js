( function ( wp ) {
	'use strict';

	if ( ! wp || ! wp.element || ! wp.plugins || ! wp.blocks || ! wp.data ) {
		return;
	}

	var h = wp.element.createElement;
	var useEffect = wp.element.useEffect;
	var useMemo = wp.element.useMemo;
	var useState = wp.element.useState;
	var registerPlugin = wp.plugins.registerPlugin;
	var PluginSidebar = ( wp.editor && wp.editor.PluginSidebar ) || ( wp.editPost && wp.editPost.PluginSidebar );
	var createBlock = wp.blocks.createBlock;
	var dispatch = wp.data.dispatch;
	var config = window.IconSearchWordPress || {};
	var searchEndpoint = config.searchEndpoint || 'https://iconsearch.info/api/icons';
	var dragMimeType = 'application/x-iconsearch-icon';

	if ( ! PluginSidebar ) {
		return;
	}

	var LIBRARIES = [
		{ value: 'all', label: 'All libraries' },
		{ value: 'lucide-icons', label: 'Lucide' },
		{ value: 'heroicons', label: 'Heroicons' },
		{ value: 'tabler-icons', label: 'Tabler' },
		{ value: 'phosphor-icons', label: 'Phosphor' },
		{ value: 'remix-icon', label: 'Remix' },
		{ value: 'bootstrap-icons', label: 'Bootstrap' },
		{ value: 'iconoir', label: 'Iconoir' },
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

	var COLOR_PRESETS = [
		'#111827',
		'#2563eb',
		'#7c3aed',
		'#db2777',
		'#dc2626',
		'#ea580c',
		'#16a34a',
		'#0891b2',
	];

	function escapeAttr( value ) {
		return String( value || '' )
			.replace( /&/g, '&amp;' )
			.replace( /"/g, '&quot;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' );
	}

	function normalizeUrl( url ) {
		var value = String( url || '' ).trim();
		if ( ! value ) return '';
		if ( value.indexOf( '//' ) === 0 ) return 'https:' + value;
		if ( /^https:\/\//i.test( value ) ) return value;
		return '';
	}

	function displayName( icon ) {
		return icon.displayName || icon.name || 'Icon';
	}

	function getIconUrl( icon ) {
		return normalizeUrl( icon.svgUrl );
	}

	function buildIconHtml( icon, settings ) {
		var size = Math.max( 12, Math.min( 256, Number( settings.size ) || 48 ) );
		var color = /^#[0-9a-f]{3,8}$/i.test( settings.color ) ? settings.color : '#111827';
		var url = getIconUrl( icon );
		var label = displayName( icon );

		return [
			'<span class="iconsearch-icon"',
			' role="img"',
			' aria-label="' + escapeAttr( label ) + '"',
			' data-iconsearch-icon="' + escapeAttr( icon.id || icon.name ) + '"',
			' data-iconsearch-library="' + escapeAttr( icon.libraryName || icon.library ) + '"',
			' style="display:inline-block;width:' + size + 'px;height:' + size + 'px;vertical-align:-0.125em;background-color:' + escapeAttr( color ) + ';-webkit-mask:url(\'' + escapeAttr( url ) + '\') no-repeat center / contain;mask:url(\'' + escapeAttr( url ) + '\') no-repeat center / contain;"',
			'></span>',
		].join( '' );
	}

	function insertIconBlock( icon, settings ) {
		var html = buildIconHtml( icon, settings );
		var caption = '<!-- IconSearch: ' + escapeAttr( displayName( icon ) ) + ' from ' + escapeAttr( icon.libraryName || icon.library ) + ' -->';
		var block = createBlock( 'core/html', { content: caption + '\n' + html } );
		var editorDispatch = dispatch( 'core/block-editor' );

		if ( editorDispatch && editorDispatch.insertBlocks ) {
			editorDispatch.insertBlocks( block );
			return true;
		}

		return false;
	}

	function startIconDrag( event, icon, settings ) {
		var payload = JSON.stringify( {
			icon: icon,
			settings: settings,
		} );
		var html = buildIconHtml( icon, settings );

		event.dataTransfer.effectAllowed = 'copy';
		event.dataTransfer.setData( dragMimeType, payload );
		event.dataTransfer.setData( 'text/html', html );
		event.dataTransfer.setData( 'text/plain', displayName( icon ) );
	}

	function useIconSearch( query, library, style, legalOnly ) {
		var _useState = useState( [] );
		var icons = _useState[ 0 ];
		var setIcons = _useState[ 1 ];
		var _useState2 = useState( 0 );
		var total = _useState2[ 0 ];
		var setTotal = _useState2[ 1 ];
		var _useState3 = useState( false );
		var loading = _useState3[ 0 ];
		var setLoading = _useState3[ 1 ];
		var _useState4 = useState( '' );
		var error = _useState4[ 0 ];
		var setError = _useState4[ 1 ];

		useEffect( function () {
			var controller = new AbortController();
			var handle = window.setTimeout( function () {
				var url = new URL( searchEndpoint );
				url.searchParams.set( 'q', query );
				url.searchParams.set( 'lib', library );
				url.searchParams.set( 'style', style );
				url.searchParams.set( 'legalOnly', legalOnly ? '1' : '0' );
				url.searchParams.set( 'limit', '48' );
				url.searchParams.set( 'sort', query ? 'relevance' : 'popular' );

				setLoading( true );
				setError( '' );

				fetch( url.toString(), { signal: controller.signal } )
					.then( function ( response ) {
						if ( ! response.ok ) {
							throw new Error( 'IconSearch returned ' + response.status );
						}
						return response.json();
					} )
					.then( function ( data ) {
						setIcons( Array.isArray( data.icons ) ? data.icons : [] );
						setTotal( Number( data.total ) || 0 );
					} )
					.catch( function ( fetchError ) {
						if ( controller.signal.aborted ) return;
						setIcons( [] );
						setTotal( 0 );
						setError( fetchError.message || 'Search failed.' );
					} )
					.finally( function () {
						if ( ! controller.signal.aborted ) {
							setLoading( false );
						}
					} );
			}, 220 );

			return function () {
				window.clearTimeout( handle );
				controller.abort();
			};
		}, [ query, library, style, legalOnly, setError, setIcons, setLoading, setTotal ] );

		return {
			icons: icons,
			total: total,
			loading: loading,
			error: error,
		};
	}

	function IconPreview( props ) {
		var icon = props.icon;
		var color = props.color;
		var size = props.size;
		var url = getIconUrl( icon );

		return h( 'span', {
			className: 'iconsearch-preview-shape',
			style: {
				width: size + 'px',
				height: size + 'px',
				backgroundColor: color,
				WebkitMask: 'url("' + url + '") no-repeat center / contain',
				mask: 'url("' + url + '") no-repeat center / contain',
			},
		} );
	}

	function IconCard( props ) {
		var icon = props.icon;
		var settings = props.settings;
		var onSelect = props.onSelect;
		var isSelected = props.isSelected;

		return h(
			'button',
			{
				type: 'button',
				className: 'iconsearch-card' + ( isSelected ? ' is-selected' : '' ),
				draggable: true,
				onClick: function () {
					onSelect( icon );
				},
				onDragStart: function ( event ) {
					startIconDrag( event, icon, settings );
				},
				title: 'Click to preview. Drag into the editor or use Insert.',
			},
			h(
				'span',
				{ className: 'iconsearch-card-preview', 'aria-hidden': 'true' },
				h( IconPreview, { icon: icon, color: settings.color, size: Math.min( 46, settings.size ) } )
			),
			h( 'span', { className: 'iconsearch-card-name' }, displayName( icon ) ),
			h( 'span', { className: 'iconsearch-card-library' }, icon.libraryName || icon.library || 'IconSearch' )
		);
	}

	function ControlLabel( props ) {
		return h( 'label', { className: 'iconsearch-control-label' }, props.children );
	}

	function IconSearchSidebar() {
		var _useState = useState( 'arrow' );
		var query = _useState[ 0 ];
		var setQuery = _useState[ 1 ];
		var _useState2 = useState( 'all' );
		var library = _useState2[ 0 ];
		var setLibrary = _useState2[ 1 ];
		var _useState3 = useState( 'all' );
		var style = _useState3[ 0 ];
		var setStyle = _useState3[ 1 ];
		var _useState4 = useState( true );
		var legalOnly = _useState4[ 0 ];
		var setLegalOnly = _useState4[ 1 ];
		var _useState5 = useState( 48 );
		var size = _useState5[ 0 ];
		var setSize = _useState5[ 1 ];
		var _useState6 = useState( '#111827' );
		var color = _useState6[ 0 ];
		var setColor = _useState6[ 1 ];
		var _useState7 = useState( null );
		var selected = _useState7[ 0 ];
		var setSelected = _useState7[ 1 ];
		var _useState8 = useState( '' );
		var notice = _useState8[ 0 ];
		var setNotice = _useState8[ 1 ];
		var settings = useMemo( function () {
			return { size: Number( size ) || 48, color: color };
		}, [ size, color ] );
		var search = useIconSearch( query, library, style, legalOnly );
		var selectedIcon = selected || search.icons[ 0 ] || null;

		useEffect( function () {
			function handleDrop( event ) {
				if ( ! event.dataTransfer || ! Array.prototype.includes.call( event.dataTransfer.types || [], dragMimeType ) ) {
					return;
				}

				try {
					var payload = JSON.parse( event.dataTransfer.getData( dragMimeType ) );
					if ( payload && payload.icon ) {
						event.preventDefault();
						event.stopPropagation();
						insertIconBlock( payload.icon, payload.settings || settings );
						setNotice( 'Icon inserted from drag.' );
					}
				} catch {}
			}

			function handleDragOver( event ) {
				if ( event.dataTransfer && Array.prototype.includes.call( event.dataTransfer.types || [], dragMimeType ) ) {
					event.preventDefault();
					event.dataTransfer.dropEffect = 'copy';
				}
			}

			document.addEventListener( 'drop', handleDrop, true );
			document.addEventListener( 'dragover', handleDragOver, true );

			return function () {
				document.removeEventListener( 'drop', handleDrop, true );
				document.removeEventListener( 'dragover', handleDragOver, true );
			};
		}, [ settings, setNotice ] );

		function insertSelected() {
			if ( ! selectedIcon ) return;
			if ( insertIconBlock( selectedIcon, settings ) ) {
				setNotice( 'Inserted ' + displayName( selectedIcon ) + '.' );
			}
		}

		return h(
			PluginSidebar,
			{
				name: 'iconsearch-sidebar',
				title: 'IconSearch',
				icon: 'search',
				className: 'iconsearch-sidebar',
			},
			h(
				'div',
				{ className: 'iconsearch-panel' },
				h(
					'header',
					{ className: 'iconsearch-hero' },
					h( 'div', { className: 'iconsearch-mark' }, 'IS' ),
					h(
						'div',
						null,
						h( 'h2', null, 'IconSearch' ),
						h( 'p', null, 'Search, style, click, or drag icons into your page.' )
					)
				),
				h(
					'section',
					{ className: 'iconsearch-preview-panel' },
					selectedIcon
						? h(
								'div',
								{ className: 'iconsearch-large-preview' },
								h( IconPreview, { icon: selectedIcon, color: color, size: Math.min( 92, Number( size ) || 48 ) } )
						  )
						: h( 'div', { className: 'iconsearch-large-preview is-empty' }, 'Search icons' ),
					h(
						'div',
						{ className: 'iconsearch-selected-meta' },
						h( 'strong', null, selectedIcon ? displayName( selectedIcon ) : 'No icon selected' ),
						h( 'span', null, selectedIcon ? selectedIcon.libraryName || selectedIcon.library : 'Try arrow, home, cart, search...' )
					)
				),
				h(
					'section',
					{ className: 'iconsearch-controls' },
					h(
						ControlLabel,
						null,
						'Search',
						h( 'input', {
							type: 'search',
							value: query,
							placeholder: 'home, arrow, cart...',
							onChange: function ( event ) {
								setQuery( event.target.value );
							},
						} )
					),
					h(
						'div',
						{ className: 'iconsearch-control-grid' },
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
								LIBRARIES.map( function ( item ) {
									return h( 'option', { key: item.value, value: item.value }, item.label );
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
								STYLES.map( function ( item ) {
									return h( 'option', { key: item.value, value: item.value }, item.label );
								} )
							)
						)
					),
					h(
						'div',
						{ className: 'iconsearch-control-row' },
						h(
							ControlLabel,
							null,
							'Size',
							h( 'input', {
								type: 'range',
								min: '16',
								max: '128',
								step: '2',
								value: size,
								onChange: function ( event ) {
									setSize( Number( event.target.value ) );
								},
							} )
						),
						h( 'span', { className: 'iconsearch-size-value' }, size + 'px' )
					),
					h(
						ControlLabel,
						null,
						'Color',
						h(
							'div',
							{ className: 'iconsearch-color-row' },
							h( 'input', {
								type: 'color',
								value: color,
								onChange: function ( event ) {
									setColor( event.target.value );
								},
							} ),
							COLOR_PRESETS.map( function ( preset ) {
								return h( 'button', {
									key: preset,
									type: 'button',
									className: 'iconsearch-swatch' + ( preset === color ? ' is-active' : '' ),
									style: { background: preset },
									'aria-label': 'Use ' + preset,
									onClick: function () {
										setColor( preset );
									},
								} );
							} )
						)
					),
					h(
						'label',
						{ className: 'iconsearch-check' },
						h( 'input', {
							type: 'checkbox',
							checked: legalOnly,
							onChange: function ( event ) {
								setLegalOnly( event.target.checked );
							},
						} ),
						h( 'span', null, 'Commercial-safe licenses only' )
					)
				),
				h(
					'div',
					{ className: 'iconsearch-action-row' },
					h(
						'button',
						{
							type: 'button',
							className: 'iconsearch-primary',
							disabled: ! selectedIcon,
							onClick: insertSelected,
						},
						'Insert selected'
					),
					h( 'span', { className: 'iconsearch-count' }, search.loading ? 'Searching...' : search.total.toLocaleString() + ' results' )
				),
				notice ? h( 'div', { className: 'iconsearch-notice' }, notice ) : null,
				search.error ? h( 'div', { className: 'iconsearch-error' }, search.error ) : null,
				h(
					'section',
					{ className: 'iconsearch-results' },
					search.icons.map( function ( icon ) {
						return h( IconCard, {
							key: icon.id || icon.library + '-' + icon.name,
							icon: icon,
							settings: settings,
							isSelected: selectedIcon && ( selectedIcon.id || selectedIcon.name ) === ( icon.id || icon.name ),
							onSelect: setSelected,
						} );
					} )
				),
				! search.loading && ! search.icons.length
					? h( 'div', { className: 'iconsearch-empty' }, 'No icons found. Try a broader search.' )
					: null
			)
		);
	}

	registerPlugin( 'iconsearch', {
		render: IconSearchSidebar,
		icon: 'search',
	} );
} )( window.wp );
