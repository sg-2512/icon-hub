<?php
/**
 * Remove IconSearch user sessions when the plugin is deleted.
 *
 * @package IconSearch
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_metadata( 'user', 0, '_iconsearch_wordpress_session', '', true );
