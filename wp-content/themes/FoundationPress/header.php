<?php
/**
 * The template for displaying the header
 *
 * Displays all of the head element and everything up until the "container" div.
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

?>
<!doctype html>
<html class="no-js" <?php language_attributes(); ?> >
	<head>
		<meta charset="<?php bloginfo( 'charset' ); ?>" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="stylesheet" type="text/css" href="http://198.58.102.147/pbl_med_mal/wp-content/themes/FoundationPress/slick/slick.css"/>
		<link rel="stylesheet" type="text/css" href="http://198.58.102.147/pbl_med_mal/wp-content/themes/FoundationPress/slick/slick-theme.css"/>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css">

		<?php wp_head(); ?>
	</head>

	<body <?php body_class(); ?>>
	<?php do_action( 'foundationpress_after_body' ); ?>
	<?php do_action( 'foundationpress_layout_start' ); ?>


<div id="header" class="fixed transition">
	<header class="row no-max pad main">
		<nav id="mainnav" class="mainnav" role="navigation">
			<ul class="menu">
				<style media="screen">
				.animateddrawer{
					display: none !important;
				}
				div.fullscreenmenu ul.nav-menu li{
				  border-bottom: none !important;
				}
				.navcontent{
					padding: 1%;
				}
				.nav-menu li a{
					font-size: 110%;
					text-transform: uppercase;
					/*font-weight: bold;*/
				}
				a[href="http://198.58.102.147/pbl_med_mal/practice_area/catastrophic-patient-injuries/"], a[href="http://www.redirectdigital.com/"], a[href="http://198.58.102.147/pbl_med_mal/practice_area/medication-errors/"], a[href="http://198.58.102.147/pbl_med_mal/practice_area/surgical-errors/"], a[href="http://198.58.102.147/pbl_med_mal/practice_area/hospital-misdiagnosis/"]{
					font-size: 80% !important;
					font-weight: 300;
				}
				a[href="http://198.58.102.147/pbl_med_mal/practice_area/catastrophic-patient-injuries/"]{
					margin-bottom: 20px;
				}
				a[href="http://198.58.102.147/pbl_med_mal/about/"]{
					border-top: solid 5px #fcbc1e;
					width: 60%;
					margin-left: auto;
					margin-right: auto;
				}

				@media screen and (max-width: 850px){
					#schedule{
						display: none;
					}
				}
				@media screen and (max-width: 425px){
					.desk-logo{
						width: 75%;
					}
					.nav-menu li a{
						font-size: 80%;
					}
					.fa-bars{
						top: 20px;
						right: 30px;
					}
				}
				</style>
				<li class="home"><a class="desk-logo" href="<?php bloginfo('url'); ?>"><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2016/12/charles_thronson_logo.png" width="300" style="z-index: 5;"alt="<?php bloginfo('name'); ?>"/></a></li>
				<li><span id="schedule">Schedule a free consultation: 800-532-0021</span></li>
				<i class="fa fa-bars fa-4x"  onclick="menu1.togglemenu(); return false"></i>
			</ul>
			<div class="navi hide">
				<?php
					$defaults = array(
						'container' => false,
						'theme_location' => 'primary-menu',
						'menu_class' => 'no-bullet menu sticky cap'
					);
					wp_nav_menu($defaults)
				 ?>
			</div>
		</nav>
	</header>
</div>


	<section class="container">
		<?php do_action( 'foundationpress_after_header' );
