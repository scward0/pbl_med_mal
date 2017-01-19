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
        <h4><?php the_title(); ?></h4>
        <div class="date">
          <?php the_field('date'); ?>
        </div>
        <?php wp_trim_words( the_field('entry'), 40, '...'); ?>
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
