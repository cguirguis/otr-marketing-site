'use strict';

angular.module("brochure").directive('textInputDescription', function() {
    return function(scope, element, attrs) {

        var textElem = "<div class='text-input-description'>" + attrs.textInputDescription + "</div>"
        $(element).after(textElem);

    };
});