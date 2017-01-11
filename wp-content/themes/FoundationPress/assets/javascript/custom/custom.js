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
