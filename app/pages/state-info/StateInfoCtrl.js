(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('StateInfoCtrl', StateInfoCtrl);


    StateInfoCtrl.$inject = ['ENV', '$scope', '$stateParams', '$window', '$timeout', '$location', '$anchorScroll', 'GlobalUtils'];
    function StateInfoCtrl(ENV, $scope, $stateParams, $window, $timeout, $location, $anchorScroll, GlobalUtils) {
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

        vm.goToFightView = function() {
            vm.viewType = 'Fight';
            $window.scrollTo(0, 400);
        };

        vm.scrollTo = function(id) {
            $anchorScroll.yOffset = 110;
            $location.hash(id);
            $anchorScroll();
        }

        // Fix top and left content nav bars so that they're sticky once
        // user has scrolled past a certain point
        $scope.$on('$viewContentLoaded', function(){
            $timeout(function() {
                var leftNav = $(".left-nav");
                var contentNav = $('.content-nav');
                var contentWrapper = $('.content-wrapper');
                var leftNavHeight = leftNav.outerHeight();
                var topNavHeight = $('.navbar').outerHeight();
                var aboveHeight = $('.content-header').outerHeight();
                var contentTopPadding = $(".content-body").css("padding-top").substr(0,2);
                $(window).scroll(function(){
                    if ($(window).scrollTop() > aboveHeight){
                        var footerTopPos = $("#footer-wrapper")[0].getBoundingClientRect().top - 100;
                        var leftNavBottomPos = leftNav.position().top + leftNavHeight;
                        var footerCollision = footerTopPos < leftNavBottomPos ||
                            footerTopPos < (145 + leftNavHeight);

                        if (footerCollision) {
                            leftNav.css('top', footerTopPos - leftNavHeight + 'px');
                        } else {
                            contentNav.addClass('fixed').css('top', topNavHeight + 'px')
                                .next().css("padding-top", parseInt(contentTopPadding) + 50 + "px");
                            leftNav.addClass('fixed').css('top', '145px').css('left', '30px');
                            contentWrapper.css("margin-left", "240px");
                        }
                    } else {
                        contentNav.removeClass('fixed').next().css("padding-top", contentTopPadding + "px");
                        leftNav.removeClass('fixed');
                        contentWrapper.css("margin-left", "0");
                    }
                }   );
            });
        });
    }

})();