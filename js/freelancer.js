/*!
 * Start Bootstrap - Freelancer Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

 $(document).ready(function() {
	$(".menu-item.page-scroll").removeClass("active");
	$(".menu-main-menu li:first-child").addClass("active");
});

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('body').on('click', '.page-scroll a', function(event) {
        var $anchor = $(this);
		$(".menu-item.page-scroll").removeClass("active");
		$anchor.parent().addClass("active");
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});


$(".navbar-toggle").click(function() {
  
  $(".navbar-ex1-collapse").attr("style", "");
      
	$(".navbar-ex1-collapse").toggleClass("in");
	
	if ($(".navbar-ex1-collapse").hasClass("in") && $(".navbar-toggle").data('toggle') == "expanded") {
    $(".navbar-toggle").data('toggle', "collapse");
  } else {
    //$(".navbar-toggle").data('toggle', "expanded");
  }
    
	event.stopPropagation();
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle').click();
    
    $(".navbar-ex1-collapse").attr("style", "display:none");
    $(".navbar-ex1-collapse").removeClass("in");
    
    event.stopPropagation();
    event.stopImmediatePropagation();
});


