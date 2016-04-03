(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('DefaultTemplateCtrl', DefaultTemplateCtrl);


    DefaultTemplateCtrl.$inject = ['$window', '$timeout', 'GlobalUtils'];
    function DefaultTemplateCtrl($window, $timeout, GlobalUtils) {
        var vm = this,
            isMobileDevice = GlobalUtils.isMobileDevice();

        // ----- TODO: Need to move this back in the view -----------------------------
        $("ul#menu-main-menu li").click(function() {
            if (isMobileDevice) {
                $(this).parent().parent().hide();
            }
        });
        $("button.navbar-toggle").click(function() {
            $("ul#menu-main-menu").parent().toggle();
        });

        // ----- INTERFACE ------------------------------------------------------------
        vm.fightTicketRedirect = fightTicketRedirect;


        // ----- PUBLIC METHODS -------------------------------------------------------

        function fightTicketRedirect() {

            var appUrl = GlobalUtils.getAppUrl();

            $timeout(function() {
                $window.location.href= appUrl;
            });
        }
    }


})();