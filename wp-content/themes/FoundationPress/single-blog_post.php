<div class="container">
  <div style="background: url('<?php the_field('hero'); ?>'); height: 50%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover;" >
    <?php get_header(); ?>
  </div>
</div>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>


  <div class="container white">
    <div class="row">
      <div class="columns small-12 medium-12 large-8" id="blog-post">
        <h3 class="text-center" style="text-transform: uppercase; color: #374A58; margin: 0;"><?php the_title(); ?></h3>
        <p id="date" style="font-size: 20px !important; color: #9FA1A0; margin: 0; text-transform: uppercase;">
          <?php echo get_field('date'); ?>
        </p>
        <p id="entry" style="font-size: 16px !important; color: #9FA1A0;margin: 0;">
          <?php echo get_field('entry'); ?>
        </p>
      </div>
      <div id="form" class="columns small-12 medium-12 large-4">
          <?php the_field('ninja'); ?>
      </div>
    </div>
    <div class="row">
      <div class="columns small-12 medium-12 large-12">
        <div class="embed-container" style="padding: 10%;">
	         <?php the_field('video'); ?>
         </div>
      </div>
    </div>
  </div>

<?php endwhile; else : ?>

<p><?php _e( 'Sorry, no pages found' ); ?></p>

<?php endif; ?>

<?php get_footer(); ?>
