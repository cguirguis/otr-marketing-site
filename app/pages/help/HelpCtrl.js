(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('HelpCtrl', HelpCtrl);


    HelpCtrl.$inject = ['ENV', '$window', '$location', '$rootScope', '$scope', '$timeout', '$anchorScroll', '$http', '$q', 'GlobalUtils'];
    function HelpCtrl(ENV, $window, $location, $rootScope, $scope, $timeout, $anchorScroll, $http, $q, GlobalUtils) {
        var vm = this;

        // ----- INTERFACE ------------------------------------------------------------
        vm.scrollTo = scrollTo;

        // ----- PUBLIC METHODS -------------------------------------------------------

        function scrollTo(id) {
            $anchorScroll.yOffset = 70;
            $location.hash(id);
            $anchorScroll();
        }


    }
})();