<?php
/**
 * Plugin Name:       IconSearch
 * Plugin URI:        https://iconsearch.info/wordpress-plugin
 * Description:       Search, customize, and insert editable SVG icons in the WordPress block editor.
 * Version:           0.2.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            IconSearch
 * Author URI:        https://iconsearch.info
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       iconsearch
 * Domain Path:       /languages
 *
 * @package IconSearch
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ICONSEARCH_PLUGIN_VERSION', '0.2.0' );
define( 'ICONSEARCH_API_BASE', 'https://iconsearch.info' );
define( 'ICONSEARCH_SESSION_META_KEY', '_iconsearch_wordpress_session' );
define( 'ICONSEARCH_REST_NAMESPACE', 'iconsearch/v1' );

/**
 * Enqueue the Gutenberg sidebar.
 */
function iconsearch_enqueue_block_editor_assets() {
	$script_path = plugin_dir_path( __FILE__ ) . 'assets/editor.js';
	$style_path  = plugin_dir_path( __FILE__ ) . 'assets/editor.css';

	wp_enqueue_script(
		'iconsearch-editor',
		plugins_url( 'assets/editor.js', __FILE__ ),
		array(
			'wp-api-fetch',
			'wp-blocks',
			'wp-components',
			'wp-compose',
			'wp-data',
			'wp-edit-post',
			'wp-editor',
			'wp-element',
			'wp-i18n',
			'wp-plugins',
		),
		file_exists( $script_path ) ? (string) filemtime( $script_path ) : ICONSEARCH_PLUGIN_VERSION,
		true
	);

	wp_enqueue_style(
		'iconsearch-editor',
		plugins_url( 'assets/editor.css', __FILE__ ),
		array( 'wp-components' ),
		file_exists( $style_path ) ? (string) filemtime( $style_path ) : ICONSEARCH_PLUGIN_VERSION
	);

	wp_add_inline_script(
		'iconsearch-editor',
		'window.IconSearchWordPress = ' . wp_json_encode(
			array(
				'restPath'  => '/' . ICONSEARCH_REST_NAMESPACE,
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'homepage'  => 'https://iconsearch.info',
				'privacy'   => 'https://iconsearch.info/privacy-policy',
				'terms'     => 'https://iconsearch.info/terms',
				'version'   => ICONSEARCH_PLUGIN_VERSION,
			)
		) . ';',
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'iconsearch_enqueue_block_editor_assets' );

/**
 * Check whether the current WordPress user can use the editor integration.
 *
 * @return bool
 */
function iconsearch_rest_permission_check() {
	return is_user_logged_in() && current_user_can( 'edit_posts' );
}

/**
 * Register the authenticated WordPress REST endpoints used by the editor.
 */
function iconsearch_register_rest_routes() {
	register_rest_route(
		ICONSEARCH_REST_NAMESPACE,
		'/session',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'iconsearch_rest_session',
			'permission_callback' => 'iconsearch_rest_permission_check',
		)
	);

	register_rest_route(
		ICONSEARCH_REST_NAMESPACE,
		'/auth/start',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'iconsearch_rest_auth_start',
			'permission_callback' => 'iconsearch_rest_permission_check',
		)
	);

	register_rest_route(
		ICONSEARCH_REST_NAMESPACE,
		'/auth/status',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'iconsearch_rest_auth_status',
			'permission_callback' => 'iconsearch_rest_permission_check',
			'args'                => array(
				'deviceCode' => array(
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				),
			),
		)
	);

	register_rest_route(
		ICONSEARCH_REST_NAMESPACE,
		'/auth/sign-out',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'iconsearch_rest_sign_out',
			'permission_callback' => 'iconsearch_rest_permission_check',
		)
	);

	register_rest_route(
		ICONSEARCH_REST_NAMESPACE,
		'/icons',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'iconsearch_rest_icons',
			'permission_callback' => 'iconsearch_rest_permission_check',
		)
	);

	register_rest_route(
		ICONSEARCH_REST_NAMESPACE,
		'/svg',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'iconsearch_rest_svg',
			'permission_callback' => 'iconsearch_rest_permission_check',
			'args'                => array(
				'library' => array(
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_key',
					'validate_callback' => 'iconsearch_validate_icon_segment',
				),
				'name'    => array(
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_file_name',
					'validate_callback' => 'iconsearch_validate_icon_segment',
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'iconsearch_register_rest_routes' );

/**
 * Validate an IconSearch path segment.
 *
 * @param mixed $value Value to validate.
 * @return bool
 */
function iconsearch_validate_icon_segment( $value ) {
	return is_string( $value ) && 1 === preg_match( '/^[a-z0-9][a-z0-9._-]*$/i', $value );
}

/**
 * Return the encryption key derived from the site's private authentication salt.
 *
 * @return string
 */
function iconsearch_encryption_key() {
	return hash( 'sha256', wp_salt( 'auth' ), true );
}

/**
 * Encrypt a bearer token before saving it in user metadata.
 *
 * @param string $token Bearer token.
 * @return string|WP_Error
 */
function iconsearch_encrypt_token( $token ) {
	if ( ! function_exists( 'openssl_encrypt' ) ) {
		return new WP_Error(
			'iconsearch_encryption_unavailable',
			__( 'OpenSSL is required to store the IconSearch session securely.', 'iconsearch' ),
			array( 'status' => 500 )
		);
	}

	try {
		$iv = random_bytes( 12 );
	} catch ( Exception $error ) {
		return new WP_Error(
			'iconsearch_random_unavailable',
			__( 'Secure random bytes are unavailable on this server.', 'iconsearch' ),
			array( 'status' => 500 )
		);
	}

	$tag        = '';
	$ciphertext = openssl_encrypt(
		$token,
		'aes-256-gcm',
		iconsearch_encryption_key(),
		OPENSSL_RAW_DATA,
		$iv,
		$tag
	);

	if ( false === $ciphertext || 16 !== strlen( $tag ) ) {
		return new WP_Error(
			'iconsearch_encryption_failed',
			__( 'The IconSearch session could not be encrypted.', 'iconsearch' ),
			array( 'status' => 500 )
		);
	}

	return 'v1:' . base64_encode( $iv . $tag . $ciphertext );
}

/**
 * Decrypt a bearer token from user metadata.
 *
 * @param string $encrypted Encrypted token.
 * @return string
 */
function iconsearch_decrypt_token( $encrypted ) {
	if ( ! function_exists( 'openssl_decrypt' ) || 0 !== strpos( $encrypted, 'v1:' ) ) {
		return '';
	}

	$payload = base64_decode( substr( $encrypted, 3 ), true );
	if ( false === $payload || strlen( $payload ) <= 28 ) {
		return '';
	}

	$iv         = substr( $payload, 0, 12 );
	$tag        = substr( $payload, 12, 16 );
	$ciphertext = substr( $payload, 28 );
	$token      = openssl_decrypt(
		$ciphertext,
		'aes-256-gcm',
		iconsearch_encryption_key(),
		OPENSSL_RAW_DATA,
		$iv,
		$tag
	);

	return is_string( $token ) ? $token : '';
}

/**
 * Return the saved session for a WordPress user.
 *
 * @param int $user_id WordPress user ID.
 * @return array<string,mixed>|null
 */
function iconsearch_get_user_session( $user_id ) {
	$stored = get_user_meta( $user_id, ICONSEARCH_SESSION_META_KEY, true );
	if ( ! is_array( $stored ) || empty( $stored['token'] ) || empty( $stored['access'] ) ) {
		return null;
	}

	$token = iconsearch_decrypt_token( (string) $stored['token'] );
	if ( '' === $token ) {
		delete_user_meta( $user_id, ICONSEARCH_SESSION_META_KEY );
		return null;
	}

	$access = is_array( $stored['access'] ) ? $stored['access'] : array();
	if ( 'wordpress' !== ( $access['product'] ?? '' ) ) {
		delete_user_meta( $user_id, ICONSEARCH_SESSION_META_KEY );
		return null;
	}
	$expires_at = strtotime( (string) ( $access['expiresAt'] ?? '' ) );
	if ( false !== $expires_at && $expires_at <= time() ) {
		delete_user_meta( $user_id, ICONSEARCH_SESSION_META_KEY );
		return null;
	}

	return array(
		'token'  => $token,
		'access' => iconsearch_public_access( $access ),
	);
}

/**
 * Keep only public account fields returned to the editor.
 *
 * @param mixed $access Raw access payload.
 * @return array<string,mixed>
 */
function iconsearch_public_access( $access ) {
	$value = is_array( $access ) ? $access : array();

	return array(
		'email'         => sanitize_email( (string) ( $value['email'] ?? '' ) ),
		'product'       => 'wordpress',
		'tier'          => in_array( $value['tier'] ?? '', array( 'free', 'founder' ), true ) ? $value['tier'] : 'free',
		'founderNumber' => is_numeric( $value['founderNumber'] ?? null ) ? (int) $value['founderNumber'] : null,
		'expiresAt'     => sanitize_text_field( (string) ( $value['expiresAt'] ?? '' ) ),
	);
}

/**
 * Call the IconSearch service and parse a JSON response.
 *
 * @param string               $method  HTTP method.
 * @param string               $path    IconSearch API path.
 * @param array<string,mixed>  $body    Optional JSON body.
 * @param string               $token   Optional bearer token.
 * @param array<string,string> $query   Optional query values.
 * @return array<string,mixed>|WP_Error
 */
function iconsearch_remote_json( $method, $path, $body = array(), $token = '', $query = array() ) {
	$url = ICONSEARCH_API_BASE . $path;
	if ( ! empty( $query ) ) {
		$url = add_query_arg( $query, $url );
	}

	$headers = array(
		'Accept'               => 'application/json',
		'Content-Type'         => 'application/json',
		'X-IconSearch-Product' => 'wordpress',
	);
	if ( '' !== $token ) {
		$headers['Authorization'] = 'Bearer ' . $token;
	}

	$args = array(
		'method'      => $method,
		'timeout'     => 15,
		'redirection' => 0,
		'headers'     => $headers,
	);
	if ( ! empty( $body ) ) {
		$args['body'] = wp_json_encode( $body );
	}

	$response = wp_safe_remote_request( $url, $args );
	if ( is_wp_error( $response ) ) {
		return new WP_Error(
			'iconsearch_service_unavailable',
			__( 'IconSearch could not be reached. Check the site connection and try again.', 'iconsearch' ),
			array( 'status' => 502 )
		);
	}

	$status  = (int) wp_remote_retrieve_response_code( $response );
	$payload = json_decode( wp_remote_retrieve_body( $response ), true );
	$payload = is_array( $payload ) ? $payload : array();

	return array(
		'status'  => $status,
		'payload' => $payload,
	);
}

/**
 * Return the current connection state without exposing the bearer token.
 *
 * @return WP_REST_Response
 */
function iconsearch_rest_session() {
	$session = iconsearch_get_user_session( get_current_user_id() );

	return rest_ensure_response(
		array(
			'connected' => null !== $session,
			'access'    => $session ? $session['access'] : null,
		)
	);
}

/**
 * Start browser-based IconSearch sign-in.
 *
 * @return WP_REST_Response|WP_Error
 */
function iconsearch_rest_auth_start() {
	$result = iconsearch_remote_json(
		'POST',
		'/api/device/start',
		array(
			'product'    => 'wordpress',
			'clientName' => 'IconSearch WordPress plugin',
		)
	);
	if ( is_wp_error( $result ) ) {
		return $result;
	}

	if ( $result['status'] < 200 || $result['status'] >= 300 ) {
		return new WP_Error(
			'iconsearch_sign_in_start_failed',
			sanitize_text_field( (string) ( $result['payload']['error'] ?? __( 'Could not start IconSearch sign-in.', 'iconsearch' ) ) ),
			array( 'status' => $result['status'] ?: 502 )
		);
	}

	return rest_ensure_response( $result['payload'] );
}

/**
 * Poll browser sign-in and save an authorized session.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function iconsearch_rest_auth_status( WP_REST_Request $request ) {
	$device_code = sanitize_text_field( (string) $request->get_param( 'deviceCode' ) );
	$result      = iconsearch_remote_json(
		'POST',
		'/api/device/status',
		array( 'deviceCode' => $device_code )
	);
	if ( is_wp_error( $result ) ) {
		return $result;
	}

	$payload = $result['payload'];
	if ( 'authorized' !== ( $payload['status'] ?? '' ) ) {
		return new WP_REST_Response( $payload, $result['status'] ?: 200 );
	}

	$token      = is_string( $payload['token'] ?? null ) ? trim( $payload['token'] ) : '';
	$raw_access = is_array( $payload['access'] ?? null ) ? $payload['access'] : array();
	if ( strlen( $token ) < 32 || 'wordpress' !== ( $raw_access['product'] ?? '' ) ) {
		return new WP_Error(
			'iconsearch_invalid_session',
			__( 'IconSearch returned an incomplete WordPress session.', 'iconsearch' ),
			array( 'status' => 502 )
		);
	}
	$access = iconsearch_public_access( $raw_access );

	$encrypted = iconsearch_encrypt_token( $token );
	if ( is_wp_error( $encrypted ) ) {
		return $encrypted;
	}

	update_user_meta(
		get_current_user_id(),
		ICONSEARCH_SESSION_META_KEY,
		array(
			'token'  => $encrypted,
			'access' => $access,
		)
	);

	return rest_ensure_response(
		array(
			'status' => 'authorized',
			'access' => $access,
		)
	);
}

/**
 * Revoke the IconSearch session and remove it locally.
 *
 * @return WP_REST_Response
 */
function iconsearch_rest_sign_out() {
	$user_id = get_current_user_id();
	$session = iconsearch_get_user_session( $user_id );

	if ( $session ) {
		iconsearch_remote_json( 'POST', '/api/device/revoke', array(), $session['token'] );
	}

	delete_user_meta( $user_id, ICONSEARCH_SESSION_META_KEY );

	return rest_ensure_response( array( 'signedOut' => true ) );
}

/**
 * Proxy authenticated icon searches to IconSearch.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function iconsearch_rest_icons( WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$session = iconsearch_get_user_session( $user_id );
	if ( ! $session ) {
		return new WP_Error(
			'iconsearch_sign_in_required',
			__( 'Connect an IconSearch account before searching icons.', 'iconsearch' ),
			array( 'status' => 401 )
		);
	}

	$sort = sanitize_key( (string) $request->get_param( 'sort' ) );
	if ( ! in_array( $sort, array( 'popular', 'relevance', 'alphabetical' ), true ) ) {
		$sort = 'popular';
	}

	$limit = absint( $request->get_param( 'limit' ) );
	$query = array(
		'q'         => sanitize_text_field( (string) $request->get_param( 'q' ) ),
		'lib'       => sanitize_key( (string) $request->get_param( 'lib' ) ) ?: 'all',
		'style'     => sanitize_key( (string) $request->get_param( 'style' ) ) ?: 'all',
		'legalOnly' => '0' === (string) $request->get_param( 'legalOnly' ) ? '0' : '1',
		'page'      => max( 1, absint( $request->get_param( 'page' ) ) ),
		'limit'     => min( 60, max( 1, $limit ?: 40 ) ),
		'sort'      => $sort,
	);

	$result = iconsearch_remote_json(
		'GET',
		'/api/extension/icon-search',
		array(),
		$session['token'],
		$query
	);
	if ( is_wp_error( $result ) ) {
		return $result;
	}

	if ( in_array( $result['status'], array( 401, 403 ), true ) ) {
		delete_user_meta( $user_id, ICONSEARCH_SESSION_META_KEY );
	}

	return new WP_REST_Response( $result['payload'], $result['status'] ?: 502 );
}

/**
 * Proxy an authenticated SVG request and return sanitized inline markup.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function iconsearch_rest_svg( WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$session = iconsearch_get_user_session( $user_id );
	if ( ! $session ) {
		return new WP_Error(
			'iconsearch_sign_in_required',
			__( 'Connect an IconSearch account before inserting icons.', 'iconsearch' ),
			array( 'status' => 401 )
		);
	}

	$library = sanitize_key( (string) $request->get_param( 'library' ) );
	$name    = sanitize_file_name( (string) $request->get_param( 'name' ) );
	$url     = ICONSEARCH_API_BASE . '/api/svg/' . rawurlencode( $library ) . '/' . rawurlencode( preg_replace( '/\.svg$/i', '', $name ) );
	$response = wp_safe_remote_get(
		$url,
		array(
			'timeout'     => 15,
			'redirection' => 0,
			'headers'     => array(
				'Accept'               => 'image/svg+xml',
				'Authorization'        => 'Bearer ' . $session['token'],
				'X-IconSearch-Product' => 'wordpress',
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		return new WP_Error(
			'iconsearch_svg_unavailable',
			__( 'The selected SVG could not be downloaded.', 'iconsearch' ),
			array( 'status' => 502 )
		);
	}

	$status = (int) wp_remote_retrieve_response_code( $response );
	if ( in_array( $status, array( 401, 403 ), true ) ) {
		delete_user_meta( $user_id, ICONSEARCH_SESSION_META_KEY );
	}
	if ( $status < 200 || $status >= 300 ) {
		return new WP_Error(
			'iconsearch_svg_failed',
			__( 'The selected icon is temporarily unavailable.', 'iconsearch' ),
			array( 'status' => $status ?: 502 )
		);
	}

	$svg = iconsearch_sanitize_svg( wp_remote_retrieve_body( $response ) );
	if ( '' === $svg ) {
		return new WP_Error(
			'iconsearch_invalid_svg',
			__( 'The selected icon did not return valid SVG markup.', 'iconsearch' ),
			array( 'status' => 502 )
		);
	}

	return rest_ensure_response( array( 'svg' => $svg ) );
}

/**
 * Remove active content and external references from SVG markup.
 *
 * @param string $svg Raw SVG.
 * @return string
 */
function iconsearch_sanitize_svg( $svg ) {
	$clean = trim( (string) $svg );
	if ( 1 !== preg_match( '/^<svg\b/i', $clean ) ) {
		return '';
	}

	$clean = preg_replace( '/<\?[\s\S]*?\?>/', '', $clean );
	$clean = preg_replace( '/<!doctype[\s\S]*?>/i', '', $clean );
	$clean = preg_replace( '/<(script|foreignObject|iframe|object|embed|style|image|audio|video|base)\b[\s\S]*?<\/\1\s*>/i', '', $clean );
	$clean = preg_replace( '/<(script|foreignObject|iframe|object|embed|style|image|audio|video|base)\b[^>]*\/?>/i', '', $clean );
	$clean = preg_replace( '/\s(on[a-z]+)\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $clean );
	$clean = preg_replace( '/\s(?:href|xlink:href)\s*=\s*(["\'])\s*(?!#)[\s\S]*?\1/i', '', $clean );

	return is_string( $clean ) && 1 === preg_match( '/^<svg\b/i', trim( $clean ) ) ? trim( $clean ) : '';
}

/**
 * Add IconSearch's remote-service disclosure to the site's privacy policy guide.
 */
function iconsearch_add_privacy_policy_content() {
	if ( ! function_exists( 'wp_add_privacy_policy_content' ) ) {
		return;
	}

	$content = wp_kses_post(
		'<p>' .
		__( 'When an authorized editor connects and uses IconSearch, the plugin sends the search text, selected filters, and IconSearch session token to iconsearch.info. The token is encrypted before it is stored in that editor&#8217;s WordPress user metadata. No visitor data or published post content is sent to IconSearch.', 'iconsearch' ) .
		'</p><p>' .
		sprintf(
			/* translators: 1: Terms link. 2: Privacy Policy link. */
			__( 'IconSearch service: <a href="%1$s">Terms</a> and <a href="%2$s">Privacy Policy</a>.', 'iconsearch' ),
			esc_url( 'https://iconsearch.info/terms' ),
			esc_url( 'https://iconsearch.info/privacy-policy' )
		) .
		'</p>'
	);

	wp_add_privacy_policy_content( 'IconSearch', wpautop( $content, false ) );
}
add_action( 'admin_init', 'iconsearch_add_privacy_policy_content' );
