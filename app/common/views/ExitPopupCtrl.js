(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('ExitPopupCtrl', ExitPopupCtrl);

    ExitPopupCtrl.$inject = ['$rootScope', '$scope'];
    function ExitPopupCtrl($rootScope, $scope) {
        var vm = this;

        vm.title = "Will you fight your ticket?";

        // ----- INTERFACE ------------------------------------------------------------
        vm.handleExitOption = handleExitOption;
        vm.callMe = callMe;

        // ----- PUBLIC METHODS -------------------------------------------------------
        function handleExitOption(answerId) {
            if (answerId == 0) {
                vm.title = "We'd love to help.";
                $(".primary-options > div:not(.option-1-secondary-options)").hide();
                $(".option-1-secondary-options").show();
            } else if (answerId == 1) {
                vm.title = "versus your attorney";
                $("#bio_ep_content img").show();
                $(".primary-options > div:not(.option-3-secondary-options)").hide();
                $(".option-3-secondary-options").show();
            } else {
                bioEp.hidePopup();
            }
        }

        function callMe() {
            var phoneNumber = $(".customer-phone").val();

            // Do something with this number
            //

            bioEp.hidePopup();
        }
    }
})();