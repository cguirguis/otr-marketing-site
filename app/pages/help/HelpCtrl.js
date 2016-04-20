(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('HelpCtrl', HelpCtrl);


    HelpCtrl.$inject = ['ENV', '$location', '$anchorScroll', '$state'];
    function HelpCtrl(ENV, $location, $anchorScroll, $state) {
        var vm = this;

        // ----- INTERFACE ------------------------------------------------------------
        vm.scrollTo = scrollTo;
        vm.getPageTitle = getPageTitle;

        // ----- PUBLIC METHODS -------------------------------------------------------

        (function initController() {

            // console.log('title: ', $state.current.name);
            //if ($state.current.name == 'default-template.help.about-us') {
            //    vm.title = 'Our mission is to leverage technology to make legal problems as easy to solve as ordering a pizza.';
            //} else {
            //    vm.title = 'We\'re here to help';
            //}

        })();

        function scrollTo(id) {
            $anchorScroll.yOffset = 70;
            $location.hash(id);
            $anchorScroll();
        }

        function getPageTitle() {
            console.log('title: ', $state.current.name);
            if ($state.current.name == 'default-template.help.about-us') {
                vm.title = 'Our mission is to leverage technology to make legal problems as easy to solve as ordering a pizza.';
            } else {
                vm.title = 'We\'re here to help';
            }
        }


    }
})();