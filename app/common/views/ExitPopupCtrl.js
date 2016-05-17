(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('ExitPopupCtrl', ExitPopupCtrl);

    ExitPopupCtrl.$inject = ['$timeout', 'AWSService', '$templateCache'];
    function ExitPopupCtrl($timeout, AWSService, $templateCache) {
        var vm = this;

        // ----- INTERFACE ------------------------------------------------------------
        vm.submitReviewRequest = submitReviewRequest;

        // ----- PUBLIC METHODS -------------------------------------------------------

        //var emailSubject = "Free ticket review requested (exit popup)";
        var emailSubject = "Welcome to Off The Record!";
        var emailHtml = $templateCache.get('subscribe-email.html');

        function submitReviewRequest() {
            var name = $("#name").val() || "A user";
            var contactInfo = $("#email").val();

            var data = {
                name: name,
                contact: contactInfo,
                subject: emailSubject,
                emailHtml: emailHtml
            };
            AWSService.sendEmail(data);

            vm.reviewRequested = true;

            $timeout(function(){
                bioEp.hidePopup();
            }, 2000);
        }
    }
})();