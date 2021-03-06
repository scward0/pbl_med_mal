<?php get_header(); ?>

<div class="row" class="collapse hide-for-small-only" style="max-width: none;">
  <div>
    <img class="hero hide-for-small-only" src="<?php the_field('hero'); ?>" alt="hero image" style="width: 100%;" />
  </div>
</div>

<div class="row" class="collapse show-for-small-only" style="max-width: none;">
  <div>
    <img class="hero show-for-small-only" src="<?php the_field('mobile_hero'); ?>" alt="mobile hero image" style="width: 100%;" />
  </div>
</div>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

  <div class="container white">
    <!-- <div class="row">
      <h3 class="text-center secondary-title"><?php the_title(); ?></h3>
    </div> -->
    <div class="row" style="padding-top: 50px;">
      <div id="form" class="columns small-12 medium-12 large-8">
        <?php echo do_shortcode('[gravityform id="1" title="true" description="false" ajax="true"]') ?>
      </div>
      <div class="columns small-12 medium-12 large-4" id="about" style="padding: 20px;">
        <?php the_field('content'); ?>
        <br />
        <?php the_field('map'); ?>
      </div>
    </div>
  </div>

<?php endwhile; else : ?>

<p><?php _e( 'Sorry, no pages found' ); ?></p>

<?php endif; ?>





<?php get_footer(); ?>
