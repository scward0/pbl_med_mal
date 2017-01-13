<div class="container">
  <div style="background: url('<?php the_field('hero'); ?>'); height: 50%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover;" >
    <?php get_header(); ?>
  </div>
</div>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>


  <div class="container white">
    <div class="row">
      <div class="columns small-12 medium-12 large-8" id="case-study">
        <h3 class="text-center"><?php the_title(); ?></h3>
        <p id="date">
          <?php echo get_field('date'); ?>
        </p>
        <p id="entry">
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
