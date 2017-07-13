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


  <div class="container">
    <div class="row" style="padding-top: 5%;">
      <div class="columns small-12 medium-12 large-8" id="about">
        <h1 class="text-center"><?php the_title(); ?></h1>
        <p>
          <?php echo the_field('content'); ?>
        </p>
      </div>
      <div class="columns small-12 medium-12 large-4">
            <?php echo do_shortcode('[gravityform id="1" title="true" description="false" ajax="true"]') ?>
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
