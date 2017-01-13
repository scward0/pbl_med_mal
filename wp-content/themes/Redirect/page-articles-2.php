


<div class="container">
  <div style="background: url('<?php the_field('hero'); ?>'); height: 50%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover;" >
    <?php get_header(); ?>
  </div>
</div>



<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
  <div class="container white">
    <div class="row">
      <div class="columns small-12 medium-12 large-8" id="articles">
        <br><br>
        <h3 class="text-center"><?php the_title(); ?></h3>
        <br>
        <?php
          $args = array(
            'post_type' => 'article'
          );
          $query = new WP_Query ($args);
          ?>

        <?php if( $query->have_posts() ) : while($query->have_posts() ) : $query->the_post(); ?>
        <h4><?php echo get_the_title(); ?></h4>
        <p id="date">
          <?php echo get_field('date'); ?>
        </p>
        <p id="author">
          <?php echo get_field('author') ?>
        </p>
        <p id="publication">
          <i><?php echo get_field('publication') ?></i>
        </p>
        <a href="<?php the_field('url'); ?>" target="_blank" style="color: #E39F69; text-decoration: underline; font-size: 16px;">Full Article</a>
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
