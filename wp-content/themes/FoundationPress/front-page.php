<div class="collapse" style="padding: 0;">
  <div class="slick">
    <div style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/MedMal_HeaderArtboard_1.jpg'); height: 100%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover; overflow: hidden; -webkit-background-size: cover;-moz-background-size: cover;-o-background-size: cover; ">
      <img style="display: none; height:100vh !important; width: 100%; overflow: scroll !important; -webkit-overflow-scrolling: touch !important;" alt="slick hidden" />
    </div>
    <div style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/MedMal_HeaderArtboard_1_copy.jpg'); height: 100%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover; overflow: hidden; -webkit-background-size: cover;-moz-background-size: cover;-o-background-size: cover;">
      <img style="display: none; height:100vh !important; width: 100%; overflow: scroll !important; -webkit-overflow-scrolling: touch !important;" alt="slick hidden" />
    </div>
    <div style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/MedMal_HeaderArtboard_1_copy_2.jpg'); height: 100%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover; overflow: hidden; -webkit-background-size: cover;-moz-background-size: cover;-o-background-size: cover;">
      <img style="display: none; height:100vh !important; width: 100%; overflow: scroll !important; -webkit-overflow-scrolling: touch !important;" alt="slick hidden" />
    </div>
    <div style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/MedMal_HeaderArtboard_1_copy_3-1.jpg'); height: 100%; background-attachment: fixed; background-position: center; background-repeat: no-repeat; background-size: cover; overflow: hidden; -webkit-background-size: cover;-moz-background-size: cover;-o-background-size: cover;">
      <img style="display: none; height:100vh !important; width: 100%; overflow: scroll !important; -webkit-overflow-scrolling: touch !important;" alt="slick hidden" />
    </div>
  </div>
  <?php get_header(); ?>
  <div class="headline">
    <h1 class="text-center">ONE OF THE NATION'S LARGEST FIRMS</h1>
    <p class="text-center">
      HANDLING MEDICAL MALPRACTICE CASES
    </p>
    <p class="text-center">
      <a id="learn-more" class="button" href="http://198.58.102.147/pbl_med_mal/#practice-areas">LEARN MORE</a>
    </p>
  </div>
</div>

 <section class="row no-max collapse" id='pillars' style="padding: 0; margin: 0; background: #7D8F9B; ">
   <div class="small-12 medium-12 large-4 columns">
     <div class="block text-center">
       <h3 style="background: url('http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/experience2.png'); background-size:cover;" >Experience<br><br><span class="smaller">Led by Charles Thronson, the Personal Injury practice group at Parsons Behle and Latimer has more than thirty years of experience representing clients in complex medical malpractice cases.</span></h3>
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
        <a class="transition" href="<?php the_field('custom_link'); ?>"><?php the_post_thumbnail('large'); ?></a>
      </div>
    </div>
    <div class="show-for-small-only column " style="padding: 0; margin: 0;">
      <div class="practice-area transition" style="padding: 0; margin: 0;">
        <a class="transition" href="<?php the_field('custom_link'); ?>"><img src="<?php the_field('mobile_thumbnail'); ?>" alt="Practice Area" /></a>
      </div>
    </div>
  <?php endwhile; endif; wp_reset_postdata(); ?>
</section>

<section class="row no-max collapse" style="background: #374a59; padding: 50px; margin: 0;">
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
      width: 95px;
      margin: 8px;
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
    @media screen and (max-width: 640px){
      .awards{
        width: 120px;
        margin: 15px;
      }
    }
  </style>
  <div class="container" style="background: #9FACB5;">
    <div class="footer">
      <div class="row" style="padding-top: 50px;">
        <div class="columns small-12 medium-2 large-2">
          <a href="https://www.justice.org/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/AAFJ_logo.png"  class="awards" alt="AAFJ" />
        </div>
        <div class="columns small-12 medium-2 large-2">
          <a href="https://www.superlawyers.com/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/SuperLaw100.png" class="awards" alt="Top 100" /></center></a>
        </div>
        <div class="columns small-12 medium-2 large-2">
          <a href="https://www.bestlawyers.com/lawyers/charles-h-thronson/29293/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/BestLogo_2012.png"  class="awards" alt="Best 2012" /></center></a>
        </div>
        <div class="columns small-12 medium-2 large-2">
          <a href="https://www.bestlawyers.com/lawyers/charles-h-thronson/29293/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/BestLogo_2016.png" class="awards" alt="Best 2016" /></center></a>
        </div>
        <div class="columns small-12 medium-2 large-2">
          <a href="https://www.superlawyers.com/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/SuperLawMountain.png" class="awards" alt="Mountain States" /></center></a>
        </div>
        <div class="columns small-12 medium-2 large-2" >
          <a href="https://www.utahassociationforjustice.org/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/UAFJ_logo.png" class="awards" alt="UAFJ" /></center></a>
        </div>
      </div>

      <div class="row">
        <div class="columns small-12 medium-2 large-2" >
          <a href="http://www.acq5.com/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/ACQ5.png" class="awards" alt="ACQ5" /></center></a>
        </div>
        <div class="columns small-12 medium-2 large-2" >
          <a href="http://www.utahbusiness.com/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/UTBus_Peers.png" class="awards" alt="Peers" /></center></a>
        </div>
        <div class="columns small-12 medium-2 large-2" >
          <a href="http://www.naopia.com/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/NAOPIALogo.png"  class="awards" alt="NAOPIAL" /></center></a>
        </div>
        <div class="columns small-12 medium-2 large-2">
          <a href="https://www.distinguishedcounsel.org/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/top_one.png" class="awards" alt="Top One" /></center></a>
        </div>
        <div class="columns small-12 medium-2 large-2" >
          <a href="http://www.utahbusiness.com/" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/UtahBus_Elite.png"  class="awards" alt="Legal Elite" /></center></a>
        </div>
        <div class="columns small-12 medium-2 large-2" >
          <a href="http://www.martindale.com/Mr-Charles-H-Thronson/2596500-lawyer.htm" target="_blank"><center><img src="http://198.58.102.147/pbl_med_mal/wp-content/uploads/2017/01/AVPreeminent.png" class="awards" alt="AV" /></center></a>
        </div>
      </div>


    </div>
  </div>

</section>

<?php get_footer(); ?>
