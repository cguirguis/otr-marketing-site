(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('ExitPopupCtrl', ExitPopupCtrl);

    ExitPopupCtrl.$inject = ['$rootScope', '$scope', 'DataService'];
    function ExitPopupCtrl($rootScope, $scope, DataService) {
        var vm = this;

        // ----- INTERFACE ------------------------------------------------------------
        vm.submitReviewRequest = submitReviewRequest;

        // ----- PUBLIC METHODS -------------------------------------------------------

        function submitReviewRequest() {
            var name = $("#name").val() || "A user";
            var contactInfo = $("#email").val();

            // Do something with this number
            var message = name +  " has requested a free ticket review: " + contactInfo;
            DataService.sendExitFeedback(message);

            vm.reviewRequested = true;
            //bioEp.hidePopup();
        }
    }
})();