<?php 
$link = get_post_meta(1,'dc_fullscreen_menu_option',true);
$effect = $link['menu_effect'];
$menu_id = $link['menu_id'];
if($effect == ''){
	$effect = 'top';
}
$menu_items = wp_get_nav_menu_items($menu_id);
?>
<div class="fullscreenmenu <?php echo $effect;?>" id="dc-menu">
	<?php $img = plugins_url('../images/close.png', __FILE__);?>
    <div class="navcontent">
        <div ><a href='#' onClick='menu1.togglemenu(); return false'><img src="<?php echo $img;?>" class="cimg"/></a></div>
        <?php
        $menu_list = '<ul id="menu-' . $menu_id . '" class="nav-menu">';
        
        foreach ( (array) $menu_items as $key => $menu_item ) {
			$title = $menu_item->title;
			$url = $menu_item->url;
			$menu_list .= '<li><a href="' . $url . '">' . $title . '</a></li>';
        }
        echo $menu_list .= '</ul>';
        ?>
    </div>
</div>
