<div class="container">
  <div style="background: url('<?php the_field('hero'); ?>'); height: 50%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover;" >
    <?php get_header(); ?>
  </div>
</div>



<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
  <div class="container white">
    <div class="row">
      <div class="columns small-12 medium-12 large-8" id="blog-post">
        <br><br>
        <h3 class="text-center" style="text-transform: uppercase; color: #374A58; margin: 0;"><?php the_title(); ?></h3>
        <br>
        <?php
          $args = array(
            'post_type' => 'blog_post'
          );
          $query = new WP_Query ($args);
          ?>

        <?php if( $query->have_posts() ) : while($query->have_posts() ) : $query->the_post(); ?>
        <h4><?php echo get_the_title(); ?></h4>
        <p id="date" style="font-size: 20px; color: ##9FA1A0; margin: 0; text-transform: uppercase;">
          <?php echo get_field('date'); ?>
        </p>
        <p id="short-entry" style="font-size: 16px; color: #9fa1a0; margin: 0;" >
          <?php echo wp_trim_words( get_field('entry'), 40, '...'); ?>
        </p>

        <a href="<?php the_permalink(); ?>" style="color: #E39F69; text-decoration: underline; font-size: 16px;">Full Article</a>
        <br><br><br>

        <?php endwhile; endif; wp_reset_postdata(); ?>

      </div>
      <div id="form" class="columns small-12 medium-12 large-4">
          <?php the_field('ninja'); ?>
      </div>
    </div>
  </div>
<?php endwhile; endif; wp_reset_postdata(); ?>

<?php get_footer(); ?>
