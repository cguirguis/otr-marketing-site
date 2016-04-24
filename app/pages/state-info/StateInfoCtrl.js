(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('StateInfoCtrl', StateInfoCtrl)
        .controller('InsuranceModalCtrl', InsuranceModalCtrl);

    StateInfoCtrl.$inject = ['$rootScope', '$scope', '$log', '$state', '$stateParams', '$window', '$timeout', '$location', '$anchorScroll', '$uibModal', 'GlobalUtils', 'ngMeta'];
    function StateInfoCtrl($rootScope, $scope, $log, $state, $stateParams, $window, $timeout, $location, $anchorScroll, $uibModal, GlobalUtils, ngMeta) {
        var vm = this;

        vm.selectedState = _.find($rootScope.statesList, function(o) {
            return o.abbreviation == $stateParams.stateCode;
        });

        // Set state defaults if necessary
        if (!vm.selectedState.backgroundImgUrl) vm.selectedState.backgroundImgUrl = $rootScope.defaultStateValues.backgroundImgUrl;
        if (!vm.selectedState.baseFee) vm.selectedState.baseFee = $rootScope.defaultStateValues.baseFee;
        if (!vm.selectedState.successRate) vm.selectedState.successRate = $rootScope.defaultStateValues.successRate;
        if (!vm.selectedState.avgFine) vm.selectedState.avgFine = $rootScope.defaultStateValues.avgFine;

        //console.log('state code: ', $stateParams.stateCode);
        //console.log('current state: ', $state.current);
        //console.log('selected state: ', vm.selectedState);

        // Set the page title and meta tags.
        // This is a temporary workaround until ngMeta adds a feature that supports 'resolve'
        if ($state.current.name == 'default-template.state-info.overview') {
            ngMeta.setTitle(vm.selectedState.name + ' Traffic Tickets & Violations');
            ngMeta.setTag('description',
                'Learn how to fight or pay your ' + vm.selectedState.name + ' traffic ticket, ' +
                'prevent insurance increase & hire a lawyer in ' + vm.selectedState.abbreviation + '.');
        } else if ($state.current.name == 'default-template.state-info.fight') {
            ngMeta.setTitle('Fight Your ' + vm.selectedState.name + ' Traffic Ticket');
            ngMeta.setTag('description',
                'Learn why and how you should fight your traffic ticket in ' + vm.selectedState.name + ' and ' +
                'how to hire the best lawyer to help you contest your ticket.');
        }


        // ----- VARS AVAILABLE TO THE VIEW -------------------------------------------
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
            $scope.$on('$viewContentLoaded', function() {
                function showTooltip(event) {
                    $(event.target).children(".otr-tooltip").removeClass("hide");
                }
                function hideTooltip(event) {
                    $(event.target).children(".otr-tooltip").addClass("hide");
                }
                $(".fa-question-circle").on('mouseover', showTooltip);
                $(".fa-question-circle").on('mouseout', hideTooltip);
            });
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