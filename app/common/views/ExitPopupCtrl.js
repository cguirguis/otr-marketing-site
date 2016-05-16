(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('ExitPopupCtrl', ExitPopupCtrl);

    ExitPopupCtrl.$inject = ['$timeut', 'AWSService'];
    function ExitPopupCtrl($timeout, AWSService) {
        var vm = this;

        // ----- INTERFACE ------------------------------------------------------------
        vm.submitReviewRequest = submitReviewRequest;

        // ----- PUBLIC METHODS -------------------------------------------------------

        function submitReviewRequest() {
            var name = $("#name").val() || "A user";
            var contactInfo = $("#email").val();

            var data = {
                name: name,
                contact: contactInfo
            };
            AWSService.sendEmail(data);

            vm.reviewRequested = true;

            $timeout(function(){
                bioEp.hidePopup();
            }, 2000);
        }
    }
})();