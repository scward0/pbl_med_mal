

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
    <div class="row">
      <div class="columns small-12 medium-12 large-12" id="about">
        <h3 class="text-center secondary-title"><?php the_title(); ?></h3>
        <?php the_content(); ?>
      </div>
    </div>
  </div>

<?php endwhile; else : ?>

<p><?php _e( 'Sorry, no pages found' ); ?></p>

<?php endif; ?>

<?php get_footer(); ?>
