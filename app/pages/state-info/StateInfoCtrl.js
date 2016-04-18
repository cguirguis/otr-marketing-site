(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('StateInfoCtrl', StateInfoCtrl)
        .controller('InsuranceModalCtrl', InsuranceModalCtrl);

    StateInfoCtrl.$inject = ['ENV', '$rootScope', '$state', '$filter', '$stateParams', '$window', '$timeout', '$location', '$anchorScroll', '$uibModal', 'GlobalUtils'];
    function StateInfoCtrl(ENV, $rootScope, $state, $filter, $stateParams, $window, $timeout, $location, $anchorScroll, $uibModal, GlobalUtils) {
        var vm = this,

            STATES = {
                WA : {
                    abbreviation : 'WA',
                    name : 'Washington state',
                    backgroundImgUrl : 'assets/img/states/WA.jpg',
                    baseFee : 200,
                    successRate : 97,
                    avgFine : 180
                },
                OR : {
                    abbreviation : 'OR',
                    name : 'Oregon',
                    backgroundImgUrl : 'assets/img/states/OR.jpg',
                    baseFee : 350,
                    successRate : 88,
                    avgFine : 270
                },
                CA : {
                    abbreviation : 'CA',
                    name : 'California',
                    backgroundImgUrl : 'assets/img/states/CA.jpg',
                    baseFee : 300,
                    successRate : 93,
                    avgFine : 207
                },
                NY : {
                    abbreviation : 'NY',
                    name : 'New York',
                    backgroundImgUrl : 'assets/img/states/NY.jpg',
                    baseFee : 200,
                    successRate : 95,
                    avgFine : 180
                },
                TX : {
                    abbreviation : 'TX',
                    name : 'Texas',
                    backgroundImgUrl : 'assets/img/states/TX.jpg',
                    baseFee : 200,
                    successRate : 97,
                    avgFine : 107
                },
                OK : {
                    abbreviation : 'OK',
                    name : 'Oklahoma',
                    backgroundImgUrl : 'assets/img/states/OK.jpg',
                    baseFee : 200,
                    successRate : 96,
                    avgFine : 180
                }
            };

        var selectedState = $rootScope.statesList.filter(function(d) { return d.abbreviation == $stateParams.stateCode; })[0];

        if (!STATES[$stateParams.stateCode]) {
            STATES[$stateParams.stateCode] = $.extend({}, selectedState,
                {
                    abbreviation: $stateParams.stateCode,
                    name: selectedState.name,
                    backgroundImgUrl: 'assets/img/states/default.jpg',
                    baseFee: 250,
                    successRate: 95,
                    avgFine: 180
                });
        }

        // ----- VARS AVAILABLE TO THE VIEW -------------------------------------------

        vm.selectedState = STATES[$stateParams.stateCode];
        vm.insuranceIncrease = 540;
        vm.clientMonthlyPremium = 100;
        vm.selectedViolation = 0.21;

        // ----- INTERFACE ------------------------------------------------------------
        vm.fightTicketRedirect = fightTicketRedirect;
        vm.totalSavings = totalSavings;
        vm.totalTicketCost = totalTicketCost;
        vm.editInsuranceVariables = editInsuranceVariables;
        vm.updateInsuranceIncrease = updateInsuranceIncrease;
        vm.scrollTo = scrollTo;
        vm.blurTicketFineField = blurTicketFineField;

        // ----- PUBLIC METHODS -------------------------------------------------------

        (function initController() {

        })();

        function editInsuranceVariables() {
            // vm.editInsuranceInfo = true;

            var modalInstance = $uibModal.open({
                animation: true,
                //backdrop:       'static',
                templateUrl: 'updateInsurancePremium.html',
                controller: 'InsuranceModalCtrl',
                size: 'lg',
                resolve: {
                    monthlyPremium: function () {
                        return vm.clientMonthlyPremium;
                    }
                }
            });

            modalInstance.opened.then(
                function () {
                    $timeout(function() {
                        $("#monthlyPremium").select();
                    });
                }
            );

            modalInstance.result.then(
                function (data) {
                    vm.clientMonthlyPremium = data.monthlyPremium;
                    vm.selectedViolation = data.selectedViolation;
                    vm.updateInsuranceIncrease();
                    $(".edit-field-text").blur();
                },
                function (message) {
                    $log.info('message: ' + message);
                    $(".edit-field-text").blur();
                }
            );
        }

        /*
        Calculate insurance increase over 3 years:
            insurance increase = monthly premium * expected premium increase * 36 months
         */
        function updateInsuranceIncrease() {
            vm.insuranceIncrease = vm.clientMonthlyPremium * vm.selectedViolation * 36;
        }

        function totalSavings() {
            console.log('total ticket cost: ', vm.totalTicketCost());
            console.log('base fee: ', vm.selectedState.baseFee);
            return vm.totalTicketCost() - vm.selectedState.baseFee;
        }

        function totalTicketCost() {
            var ticketFine = (vm.clientTicketFine) ? vm.clientTicketFine : vm.selectedState.avgFine;
            return parseInt(ticketFine) + vm.insuranceIncrease;
        }

        function fightTicketRedirect() {

            var appUrl = GlobalUtils.getAppUrl();

            $timeout(function() {
                $window.location.href= appUrl;
            });
        }

        function scrollTo(id) {
            $anchorScroll.yOffset = 110;
            $location.hash(id);
            $anchorScroll();
        }

        function blurTicketFineField() {
            $(event.target).blur();

            if (vm.clientTicketFine != vm.selectedState.avgFine) {
                $(event.target).next(".text-input-description").hide();
            }
        }

        // Fix top and left content nav bars so that they're sticky once
        // user has scrolled past a certain point
        //$scope.$on('$viewContentLoaded', function(scope, stateName){
        //    console.log('stateName: ', stateName);
        //    if (stateName == "@default-template.state-info") {
        //
        //        var onContentLoaded = function(stateName) {
        //            var leftNav = $(".left-nav");
        //            console.log('leftNav: ', leftNav);
        //            var contentNav = $('.content-nav');
        //            var contentWrapper = $('.content-wrapper');
        //            var leftNavHeight = leftNav.outerHeight();
        //            var topNavHeight = $('.navbar').outerHeight();
        //            var aboveHeight = $('.content-header').outerHeight();
        //            var contentTopPadding = $(".content-body").css("padding-top").substr(0, 2);
        //
        //            $(window).scroll(function() {
        //                var responsiveMode = $(window).width() < 768;
        //
        //                if ($(window).scrollTop() > aboveHeight) {
        //                    var footerTopPos = $("#footer-wrapper")[0].getBoundingClientRect().top - 100;
        //                    var leftNavBottomPos = leftNav.position().top + leftNavHeight;
        //                    console.log('leftNavBottomPos: ', leftNavBottomPos);
        //                    var footerCollision = !responsiveMode
        //                        ? footerTopPos < leftNavBottomPos || footerTopPos < (145 + leftNavHeight)
        //                        : footerTopPos < 110;
        //
        //                    if (footerCollision) {
        //                        if (responsiveMode) {
        //                            contentNav.css('top', footerTopPos - 40 + 'px');
        //                        } else {
        //                            leftNav.css('top', footerTopPos - leftNavHeight + 'px');
        //                        }
        //                    } else {
        //                        contentNav.addClass('fixed').css('top', topNavHeight + 'px')
        //                            .next().css("padding-top", parseInt(contentTopPadding) + 50 + "px");
        //                        if (!responsiveMode) {
        //                            leftNav.addClass('fixed').css('top', '145px').css('left', '30px');
        //                            contentWrapper.css("margin-left", "240px");
        //                        }
        //                    }
        //                } else {
        //                    contentNav.removeClass('fixed').next().css("padding-top", contentTopPadding + "px");
        //                    leftNav.removeClass('fixed');
        //                    contentWrapper.css("margin-left", "0");
        //                }
        //            })
        //        };
        //        $timeout(onContentLoaded(stateName));
        //    }
        //});
    }

    function InsuranceModalCtrl($scope, $timeout, $uibModalInstance, monthlyPremium) {

        $scope.monthlyPremium = monthlyPremium;
        $scope.selectedViolation = 0.21;

        $scope.violationOptions = [
            { "name": "Speeding (1-15 mph over limit)", "value": 0.21 },
            { "name": "Speeding (16-30 mph over limit)", "value": 0.28 },
            { "name": "Speeding (31+ mph over limit)", "value": 0.30 },
            { "name": "Failure to stop", "value": 0.19 },
            { "name": "Failure to yield", "value": 0.19 },
            { "name": "Following too closely (tailgating)", "value": 0.1337 },
            { "name": "Improper pass", "value": 0.1365 },
            { "name": "Improper turn+", "value": 0.1433 },
            { "name": "Seatbelt infraction", "value": 0.05 },
            { "name": "HOV lane violation", "value": 0.18 },
            { "name": "Careless driving", "value": 0.27 },
            { "name": "Reckless driving", "value": 0.82 }
        ];

        $scope.ok = function () {
            $uibModalInstance.close({ monthlyPremium: $scope.monthlyPremium, selectedViolation: $scope.selectedViolation});
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

})();