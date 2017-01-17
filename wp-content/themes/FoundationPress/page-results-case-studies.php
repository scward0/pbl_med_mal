<?php get_header(); ?>

<div class="row" class="collapse show-for-medium" style="max-width: none;">
  <div>
    <img class="hero" src="<?php the_field('hero'); ?>" alt="hero image" style="width: 100%;" />
  </div>
</div>

<div class="row" class="collapse show-for-small-only" style="max-width: none;">
  <div>
    <img class="hero" src="<?php the_field('mobile_hero'); ?>" alt="mobile hero image" style="width: 100%;" />
  </div>
</div>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
  <div class="container white">
    <div class="row">
      <div class="columns small-12 medium-12 large-8" id="case-study">
        <br><br>
        <h3 class="text-center"><?php the_title(); ?></h3>
        <br>
        <?php
          $args = array(
            'post_type' => 'case_study'
          );
          $query = new WP_Query ($args);
          ?>

        <?php if( $query->have_posts() ) : while($query->have_posts() ) : $query->the_post(); ?>
        <h4><?php echo get_the_title(); ?></h4>
        <p id="date">
          <?php echo get_field('date'); ?>
        </p>

        <p id="short-entry">
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
