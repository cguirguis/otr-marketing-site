'use strict';

angular.module("brochure").directive('expandableSection', function() {
    return function(scope, element, attrs) {

        var initialHeight = $(element).css("height");

        // Attach click handler on section's child h3 element
        $(element).children("h3:first-child").on("click", function(event) {
            var contentSection = $(event.target).parent();
            contentSection.toggleClass("collapsed");

            var titleHeight = parseInt(contentSection.children("h3").css("height"));

            var collapse = contentSection.hasClass("collapsed");
            if (collapse) {
                contentSection.animate({
                    height: (titleHeight - 24 + 55) + "px"
                }, 200, function () {});
            } else {
                contentSection.animate({
                    height: initialHeight
                }, 200, function () {});
            }
        });
    };
});