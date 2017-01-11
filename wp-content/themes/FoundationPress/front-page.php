<div class="collapse" style="padding: 0;">
  <div class="slick">
    <div style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/MedMal_HeaderArtboard_1.jpg'); height: 100%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover; " src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/hero2.png">
      <img style="display: none;" alt="" />
    </div>
    <div style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/MedMal_HeaderArtboard_1_copy.jpg'); height: 100%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover;">
      <img style="display: none;" alt="" />
    </div>
    <div style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/MedMal_HeaderArtboard_1_copy_2.jpg'); height: 100%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover;">
      <img style="display: none;" alt="" />
    </div>
    <div style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/MedMal_HeaderArtboard_1_copy_3-1.jpg'); height: 100%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover;">
      <img style="display: none;" alt="" />
    </div>
  </div>
  <?php get_header(); ?>
  <div class="headline">
    <h1 class="text-center">ONE OF THE NATION'S LARGEST FIRMS</h1>
    <p class="text-center">
      HANDLING MEDICAL MALPRACTICE CASES
    </p>
    <p class="text-center">
      <a id="learn-more" class="button" href="http://redirectdigital.com/">LEARN MORE</a>
    </p>
  </div>
</div>




 <section class="row no-max collapse" id='pillars' style="padding: 0; margin: 0; background: #7D8F9B; ">
   <div class="small-12 medium-12 large-4 columns">
     <div class="block text-center">
       <h3 style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/experience2.png'); background-size:cover; opacity: .8;" >Experience<br><br><span class="smaller">Led by Charles Thronson, the Personal Injury practice group at Parsons Behle and Latimer has more than thirty years of experience representing clients in complex medical malpractice cases.</span></h3>
     </div>
   </div>
   <div class="small-12 medium-12 large-4 columns">
     <div class="block text-center">
       <h3 style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/results2.png'); background-size:cover;">Results<br><br><span class="smaller">We represent victims of medical negligence and believe they deserve the best possible legal representation in Utah. Our track record includes achieving a number of multi-million dollar settlements for our clients.</span></h3>
     </div>
   </div>
   <div class="small-12 medium-12 large-4 columns">
     <div class="block text-center">
       <h3 style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/integrity2.png'); background-size:cover;" >Integrity<br><br><span class="smaller">Our clients face enormous financial and emotional hardships as a result of medical malpractice. Our team works hand-in-hand to understand our client's injuries and assess their economic impact.</span></h3>
     </div>
   </div>
 </section>

 <?php

 $args = array(
   'post_type' => 'practice_area'
 );
 $query = new WP_Query ($args);

  ?>

<section class="row no-max collapse small-up-12 medium-up-5 large-up-5" id='practice-areas' style="padding: 0; margin: 0; background: #4d4d4d;">
  <?php if( $query->have_posts() ) : while($query->have_posts() ) : $query->the_post(); ?>
  <style>
    .practice-area { background: black;}
    .practice-area img{ opacity:0.6;}
    .practice-area:hover{ background: none;}
    .practice-area:hover img{ opacity:1;}
    @media screen and (max-width: 768px){
      .practice-area{ background: none;}
      .practice-area img{ opacity:1;}
    }
  </style>
    <div class=" hide-for-small-only column " style="padding: 0; margin: 0;">
      <div class="practice-area transition" style="padding: 0; margin: 0;">
        <a class="transition" href="<?php the_permalink(); ?>"><?php the_post_thumbnail('large'); ?></a>
      </div>
    </div>
    <div class="show-for-small-only column " style="padding: 0; margin: 0;">
      <div class="practice-area transition" style="padding: 0; margin: 0;">
        <a class="transition" href="<?php the_permalink(); ?>"><img src="<?php the_field('mobile_thumbnail'); ?>" alt="" /></a>
      </div>
    </div>
  <?php endwhile; endif; wp_reset_postdata(); ?>
</section>

<section class="row no-max" style="background: #374a59; padding: 50px; margin: 0;">
  <div class="pbl">
    <h1 class="text-center">Parsons Behle & Latimer</h1>
    <p class="text-center">
    Since 1882 our success has been firmly rooted in our fundamental core values: client service; professional integrity; ethics and professionalism; collegiality; and community service.
    </p>
  </div>
</section>

<section>
  <style media="screen">
    .awards{
      width: 110px;
      margin: 15px;
    }
    @media screen and (max-width: 640px){
      .awards{
        width: 50px;
        margin: 15px;
      }
      .pbl-logo{
      width: 75px;
      }
    }
  </style>
  <div class="container" style="background: #8E9CA7;">
    <div class="footer">
      <div class="row" style="padding-top: 50px;">
        <div class="columns small-12 medium-4 large-2 text-center">
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/top_100.png" class="awards hide" alt="" />
        </div>
        <div class="columns small-12 medium-4 large-2 text-center">
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/top_100.png" class="awards hide" alt="" />
        </div>
        <div class="columns small-12 medium-4 large-2 text-center">
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/loty_2012.png"  class="awards hide" alt="" />
        </div>
        <div class="columns small-12 medium-4 large-2 text-center">
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/loty_2016.png" class="awards hide" alt="" />
        </div>
        <div class="columns small-12 medium-4 large-2 text-center">
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/AmericanJustice.png"  class="awards hide" alt="" />
        </div>
        <div class="columns small-12 medium-4 large-2 text-center">
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/top_one.png" class="awards hide" alt="" />
        </div>

        <div class="columns small-12 medium-4 large-2 text-center" >
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/ACQaward.png" class="awards hide" alt="" />
        </div>
        <div class="columns small-12 medium-4 large-2 text-center" >
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/UtahJustice.png" class="awards hide" alt="" />
        </div>
        <div class="columns small-12 medium-4 large-2 text-center" >
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/NAOPIALogo.png"  class="awards hide" alt="" />
        </div>
        <div class="columns small-12 medium-4 large-2 text-center" >
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/peers.png" class="awards hide" alt="" />
        </div>
        <div class="columns small-12 medium-4 large-2 text-center" >
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/legal_elite.png"  class="awards hide" alt="" />
        </div>
        <div class="columns small-12 medium-4 large-2 text-center" >
          <img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/AVPreeminent.png" class="awards hide" alt="" />
        </div>
      </div>
    </div>
  </div>
</section>

<?php get_footer(); ?>
