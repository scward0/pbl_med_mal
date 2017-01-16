<?php get_header(); ?>

<div class="row" class="collapse" style="max-width: none;">
  <div>
    <img class="hero" src="<?php the_field('hero'); ?>" alt="hero image" style="width: 100%; margin-top: 95px;" />
  </div>
</div>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>


  <div class="container white">
    <div class="row">
      <div class="columns small-12 medium-12 large-8" id="case-study">
        <h3 class="text-center"><?php the_title(); ?></h3>
        <p id="date" style="font-size: 20px !important; color: #9FA1A0; margin: 0; text-transform: uppercase;">
          <?php echo get_field('date'); ?>
        </p>
        <p id="entry"  class="body-copy" style="font-size: 16px !important; color: #9FA1A0;margin: 0; font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;">
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
