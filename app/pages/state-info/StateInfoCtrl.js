(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('StateInfoCtrl', StateInfoCtrl);


    StateInfoCtrl.$inject = ['ENV', '$stateParams', '$window', '$timeout', 'GlobalUtils'];
    function StateInfoCtrl(ENV, $stateParams, $window, $timeout, GlobalUtils) {
        var vm = this,

            URLS = {
                COURTS: ENV.apiEndpoint + '/api/v1/courts/lead'
            },
            STATES = {
                "WA" : "Washington state",
                "OR" : "Oregon",
                "CA" : "California",
                "NY" : "New York",
                "TX" : "Texas",
                "OK" : "Oklahoma"
            };

        // ----- VARS AVAILABLE TO THE VIEW -------------------------------------------

        vm.viewType = "Overview";

        vm.stateCode = $stateParams.stateCode;
        vm.stateName = STATES[vm.stateCode];
        vm.backgroundImgUrl = "assets/img/states/" + vm.stateCode + ".jpg";

        vm.stateDetails = {
            "baseFee" : 250,
            "successRate" : 96,
            "avgFine" : 180
        };

        switch (vm.stateCode) {
            case "OR" :
            case "OR2" :
                vm.stateDetails = {
                    "baseFee" : 350,
                    "successRate" : 88,
                    "avgFine" : 380
                };
                break;
            case "CA" :
                vm.stateDetails = {
                    "baseFee" : 300,
                    "successRate" : 87,
                    "avgFine" : 360
                };
            case "TX" :
                vm.stateDetails = {
                    "baseFee" : 200,
                    "successRate" : 90,
                    "avgFine" : 240
                };
        }

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