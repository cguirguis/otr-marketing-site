(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('FaqCtrl', FaqCtrl);


    FaqCtrl.$inject = ['ENV', '$window', '$location', '$rootScope', '$scope', '$timeout', '$anchorScroll', '$http', '$q', 'GlobalUtils'];
    function FaqCtrl(ENV, $window, $location, $rootScope, $scope, $timeout, $anchorScroll, $http, $q, GlobalUtils) {
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