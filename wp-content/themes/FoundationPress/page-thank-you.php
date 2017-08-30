<div class="container white">
  <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
  <?php get_header(); ?>
  <div class="row">
    <div class="columns small-12 medium-12 large-8" id="about">
      <h3 class="text-center secondary-title">Thank you for your submission</h3>
      <p style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 20px; margin-top: 50px;">
      Your case information is very valuable to us, we will contact you regarding your case as soon as we can.
      </p>
    </div>
  </div>
</div>

<?php endwhile; else : ?>

<p><?php _e( 'Sorry, no pages found' ); ?></p>

<?php endif; ?>

<?php get_footer(); ?>
