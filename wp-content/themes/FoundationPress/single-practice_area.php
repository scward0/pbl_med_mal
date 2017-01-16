<!-- <div class="container">
  <div style="background: url(''); height: 50%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover;" >

  </div>
</div> -->

<?php get_header(); ?>

<div class="row" class="collapse" style="max-width: none;">
  <div class="hero">
    <img src="<?php the_field('hero'); ?>" alt="" style="width: 100%; margin-top: 95px;" />
  </div>
</div>


<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>


  <div class="container white">
    <div class="row">
      <div class="columns small-12 medium-12 large-8" id="about">
        <h3 class="text-center"><?php the_title(); ?></h3>
        <?php the_field('content'); ?>
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
