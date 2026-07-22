<?php
/**
 * Plugin Name:       IconSearch
 * Plugin URI:        https://iconsearch.info/wordpress-plugin
 * Description:       Search free SVG icons in the block editor and insert styled, draggable icons into posts and pages.
 * Version:           0.1.0
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

define( 'ICONSEARCH_PLUGIN_VERSION', '0.1.0' );
define( 'ICONSEARCH_API_BASE', 'https://iconsearch.info' );

/**
 * Enqueue the IconSearch Gutenberg sidebar.
 */
function iconsearch_enqueue_block_editor_assets() {
	$script_path = plugin_dir_path( __FILE__ ) . 'assets/editor.js';
	$style_path  = plugin_dir_path( __FILE__ ) . 'assets/editor.css';

	wp_enqueue_script(
		'iconsearch-editor',
		plugins_url( 'assets/editor.js', __FILE__ ),
		array(
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
		file_exists( $script_path ) ? filemtime( $script_path ) : ICONSEARCH_PLUGIN_VERSION,
		true
	);

	wp_enqueue_style(
		'iconsearch-editor',
		plugins_url( 'assets/editor.css', __FILE__ ),
		array( 'wp-components' ),
		file_exists( $style_path ) ? filemtime( $style_path ) : ICONSEARCH_PLUGIN_VERSION
	);

	wp_add_inline_script(
		'iconsearch-editor',
		'window.IconSearchWordPress = ' . wp_json_encode(
			array(
				'apiBase'        => ICONSEARCH_API_BASE,
				'searchEndpoint' => ICONSEARCH_API_BASE . '/api/icons',
				'homepage'       => 'https://iconsearch.info',
				'version'        => ICONSEARCH_PLUGIN_VERSION,
			)
		) . ';',
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'iconsearch_enqueue_block_editor_assets' );
