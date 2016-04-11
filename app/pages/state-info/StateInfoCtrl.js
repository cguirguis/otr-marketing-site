(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('StateInfoCtrl', StateInfoCtrl)
        .controller('InsuranceModalCtrl', InsuranceModalCtrl);

    StateInfoCtrl.$inject = ['ENV', '$scope', '$stateParams', '$window', '$timeout', '$location', '$anchorScroll', '$uibModal', 'GlobalUtils'];
    function StateInfoCtrl(ENV, $scope, $stateParams, $window, $timeout, $location, $anchorScroll, $uibModal, GlobalUtils) {
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
            "successRate" : 97,
            "avgFine" : 180
        };

        switch (vm.stateCode) {
            case "OR" :
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

        vm.ticketFine = vm.stateDetails.avgFine;
        vm.insuranceIncrease = 540;
        vm.monthlyPremium = 100;

        // ----- INTERFACE ------------------------------------------------------------
        vm.fightTicketRedirect = fightTicketRedirect;
        vm.totalSavings = totalSavings;
        vm.totalTicketCost = totalTicketCost;
        vm.editInsuranceVariables = editInsuranceVariables;
        vm.updateInsuranceIncrease = updateInsuranceIncrease;

        // ----- PUBLIC METHODS -------------------------------------------------------

        function editInsuranceVariables() {
            vm.editInsuranceInfo = true;

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'updateInsurancePremium.html',
                controller: 'InsuranceModalCtrl',
                size: 'lg',
                resolve: {
                    monthlyPremium: function () {
                        return vm.monthlyPremium;
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
                function (monthlyPremium) {
                    vm.monthlyPremium = monthlyPremium;
                    vm.updateInsuranceIncrease();
                    $(".edit-field-text").blur();
                }, function () {
                    $(".edit-field-text").blur();
                }
            );
        }

        function updateInsuranceIncrease() {
            // Calculate insurance increase over 3 years
            // monthly premium * 15% avg ticket increase * 12 months * 3 years
            var value = parseInt(vm.monthlyPremium);
            value = value * 0.15 * 12 * 3;
            vm.insuranceIncrease = GlobalUtils.numberWithCommas(value);
        }

        function totalSavings() {
            return GlobalUtils.numberWithCommas(GlobalUtils.parseDollarString(vm.totalTicketCost()) - vm.stateDetails.baseFee);
        }

        function totalTicketCost() {
            return GlobalUtils.numberWithCommas(parseInt(vm.ticketFine) + parseInt(vm.insuranceIncrease));
        }

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
        };

        vm.blurTicketFine = function() {
            $(event.target).blur();

            // If user changed value, hide 'average ticket fine'
            // description in the ticket fine input field
            if ($(event.target).val() != vm.stateDetails.avgFine) {
                $(event.target).next(".text-input-description").hide();
            }
        };

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
                    var responsiveMode = $(window).width() < 768;

                    if ($(window).scrollTop() > aboveHeight){
                        var footerTopPos = $("#footer-wrapper")[0].getBoundingClientRect().top - 100;
                        var leftNavBottomPos = leftNav.position().top + leftNavHeight;
                        var footerCollision = !responsiveMode
                            ? footerTopPos < leftNavBottomPos || footerTopPos < (145 + leftNavHeight)
                            : footerTopPos < 110;

                        if (footerCollision) {
                            if (responsiveMode) {
                                contentNav.css('top', footerTopPos - 40 + 'px');
                            } else {
                                leftNav.css('top', footerTopPos - leftNavHeight + 'px');
                            }
                        } else {
                            contentNav.addClass('fixed').css('top', topNavHeight + 'px')
                                .next().css("padding-top", parseInt(contentTopPadding) + 50 + "px");
                            if (!responsiveMode) {
                                leftNav.addClass('fixed').css('top', '145px').css('left', '30px');
                                contentWrapper.css("margin-left", "240px");
                            }
                        }
                    } else {
                        contentNav.removeClass('fixed').next().css("padding-top", contentTopPadding + "px");
                        leftNav.removeClass('fixed');
                        contentWrapper.css("margin-left", "0");
                    }
                });
            });
        });
    }

    function InsuranceModalCtrl($scope, $timeout, $uibModalInstance, monthlyPremium) {

        $scope.monthlyPremium = monthlyPremium;

        $scope.ok = function () {
            $uibModalInstance.close($scope.monthlyPremium);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

})();