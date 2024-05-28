// carousel
$(document).ready(function(){
    $('#f-products').owlCarousel({
        loop:true,
        margin:10,
        nav:true,
        autoplay:false,   
        responsive:{
            0:{
                items:1
            },
            600:{
                items:3
            },
            1000:{
                items:4
            }
        }
    });

    $('.owl-carousel').owlCarousel({
        loop:true,
        margin:10,
        nav:true,
        autoplay:true,
        autoplayTimeout:4000,
        autoplayHoverPause:true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:1
            },
            1000:{
                items:1
            }
        }
    });
    
    $('.owl-next span').text('Next >');
    $('.owl-prev span').text('< Prev');
});