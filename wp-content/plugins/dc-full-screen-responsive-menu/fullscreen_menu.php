<?php  
/* 
Plugin Name: DC - Full Screen Wordpress menu
Version: 1.0 
Author: DART Creations
Author URI: https://www.dart-creations.com
Description: Display FullScreen Menu with Effect
*/
 
add_action('admin_menu','dc_fullscreen_menu_admin_actions');
function dc_fullscreen_menu_admin_actions()
{
	add_theme_page('DC FullScreen Menu','DC FullScreen Menu','manage_options','dc_fullscreen_menu_list','dc_fullscreen_menu_admin');
}

function dc_fullscreen_menu_admin()
{ 
	if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
	$menus = array();
	// Get menus
	$menus = get_terms( 'nav_menu', array( 'hide_empty' => false ) );

	// If no menus exists, direct the user to go and create some.
	if ( !$menus ) {
		echo '<p>'. sprintf( __('No menus have been created yet. <a href="%s">Create some</a>.'), admin_url('nav-menus.php') ) .'</p>';
		return;
	}
	if(count($_POST) > 0)
	{
		$m_array = array(
			'menu_id' => sanitize_text_field($_POST['menu_list_cat']),
			'menu_effect' => sanitize_text_field($_POST['menu_list_effect']),
			'menu_author_show' => sanitize_text_field($_POST['menu_author_show']),
			'menu_author_desc' => sanitize_text_field($_POST['menu_author_desc']),
			'menu_background_color' => sanitize_text_field($_POST['menu_background_color']),
			'menu_text_color' => sanitize_text_field($_POST['menu_text_color']),
			'menu_text_font' => sanitize_text_field($_POST['menu_text_font'])
		);
        update_post_meta(1, 'dc_fullscreen_menu_option', $m_array );
	}
	$link = get_post_meta(1,'dc_fullscreen_menu_option',true);
	include(plugin_dir_path( __FILE__ ).'views/admin.php');
	wp_enqueue_style( 'style-name', plugins_url('/css/style.css',__FILE__));
}

add_action( 'admin_enqueue_scripts', 'dc_fullscreen_menu_add_color_picker' );
function dc_fullscreen_menu_add_color_picker( $hook ) {
    if( is_admin() ) { 
        // Add the color picker css file       
        wp_enqueue_style( 'wp-color-picker' ); 
        // Include our custom jQuery file with WordPress Color Picker dependency
        wp_enqueue_script( 'custom-script-handle', plugins_url( '/js/fullscreenmenu.js', __FILE__ ), array( 'wp-color-picker' ), false, true ); 
		wp_enqueue_script( 'menu_admin', plugins_url('/js/admin.js',__FILE__));
    }
}

function dc_fullscreen_menu_add_nav_class($output) {
	$link = get_post_meta(1,'dc_fullscreen_menu_option',true);
	if(isset($link) && is_array($link)){
		$menu_author_show = $link['menu_author_show'];
		$menu_author_desc = $link['menu_author_desc'];
		include(plugin_dir_path( __FILE__ ).'views/menu.php');
		$output= "<div ><a class='animateddrawer' href='#' onClick='menu1.togglemenu(); return false'><span></span></a></div>";
		if($menu_author_show == 1){
			$output.="<!-- ". $menu_author_desc." -->";
		}
	}
	return $output;
}
add_filter('wp_nav_menu', 'dc_fullscreen_menu_add_nav_class');

function dc_fullscreen_menu_add_head_js() {
	$link = get_post_meta(1,'dc_fullscreen_menu_option',true);
	$bg_color = $link['menu_background_color'];
	$text_color = $link['menu_text_color'];
	$text_font = $link['menu_text_font'];
	$custom_css = 'div.fullscreenmenu{
		background: '.$bg_color.' !important;
	}
	div.fullscreenmenu ul.nav-menu li a{
		color: '.$text_color.'!important;
		font-family: "'.$text_font.'", serif;
	}';
	wp_enqueue_style( 'menu_style', plugins_url('/css/fullscreenmenu.css',__FILE__));
	wp_add_inline_style( 'menu_style', $custom_css );
	wp_enqueue_style( 'font_style', "http://fonts.googleapis.com/css?family=".$text_font);
	wp_enqueue_script( 'menu_functions', plugins_url('/js/fullscreenmenu.js',__FILE__));
}
add_filter('wp_head', 'dc_fullscreen_menu_add_head_js');
?>