<footer>
  <div class="row" style="margin-top: 100px;">
    <div class="columns small-12 medium-6">
      <img style="float: right;" src="http://localhost/PBL_Medical_Malpractice/wp-content/uploads/2016/12/pbl_logo.png" class="pbl-logo" width="100px" alt="" />
    </div>
    <div class="columns small-12 medium-6">
      <div class="contact-info" style="float: left">
        <p  style="color: white;">
          <span style="font-size: 120%; font-weight: bold;">Charles H. Thronson</span><br>
          Parsons Behle & Latimer<br>
          201 South Main Street, Suite 1800<br>
          Salt Lake City, Utah 84111<br>
          800-532-0021
        </p>
      </div>
    </div>
  </div>

  <style media="screen">
    @media screen and (max-width: 640px){
      .pbl-logo, .contact-info{
        float: none !important;
        display: block !important;
        margin-left: auto !important;
        margin-right: auto !important;
        text-align: center !important;
      }
    }
  </style>

  <div class="row text-center">
    <br><br>
    <p style="color: white; font-size: 12px;">
      All rights reserved &copy; <?php echo date("Y"); ?> - Charles H Thronson Attorney at Law
    </p>
  </div>
</footer>

<?php wp_footer(); ?>


<script type="text/javascript" src="wp-content/themes/FoundationPress/slick/slick.min.js"></script>
<script type="text/javascript">
  $(document).ready(function(){

    $('.slick').slick({
      dots: false,
      infinite: true,
      speed: 500,
      fade: true,
      cssEase: 'linear',
      arrows: false,
      autoplay: true,
      autoplaySpeed: 8000,
    });

    $(window).scroll(function() {
      var hT = $('.footer').offset().top,
           hH = $('.footer').outerHeight(),
           wH = $(window).height(),
           wS = $(this).scrollTop();
       if (wS > (hT+hH-wH-300)){
         $('.awards').removeClass('hide');
         $('.awards').addClass('animated slideInUp fadeIn');
       }
       if (wS < (hT+hH-wH-300)){
         $('.awards').removeClass('animated slideInUp fadeIn');
         $('.awards').addClass('hide');
       }
    });

    $('.menu-icon').click(function(){
      $('.navcontent ul li').addClass('animated zoomIn');
    });
    $('.cimg').click(function(){
      $('.navcontent ul li a').removeClass('animated zoomIn');
    });
    $(".navcontent ul li a").mouseover(function(){
      $(this).addClass('animated pulse');
    });
    $(".navcontent ul li a").mouseout(function(){
      $(this).removeClass('animated pulse');
    });
    $(".practice-area").mouseover(function(){
      $(this).addClass('animated pulse');
    });
    $(".practice-area").mouseout(function(){
      $(this).removeClass('animated pulse');
    });
  });
</script>

<style media="screen">
    @keyframes slideInUp {
    from {
      -webkit-transform: translate3d(0, 300%, 0);
      transform: translate3d(0, 300%, 0);
      visibility: visible;
    }

    to {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
    }
</style>

</body>
</html>
