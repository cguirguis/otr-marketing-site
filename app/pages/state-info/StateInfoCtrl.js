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
        vm.selectedViolation = 0.21;

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
                function (data) {
                    vm.monthlyPremium = data.monthlyPremium;
                    vm.selectedViolation = data.selectedViolation;
                    vm.updateInsuranceIncrease();
                    $(".edit-field-text").blur();
                }, function () {
                    $(".edit-field-text").blur();
                }
            );
        }

        function updateInsuranceIncrease() {
            // Calculate insurance increase over 3 years
            // monthly premium * avg ticket increase * 12 months * 3 years
            var value = parseInt(vm.monthlyPremium);
            value = value * vm.selectedViolation * 12 * 3;
            vm.insuranceIncrease = GlobalUtils.numberWithCommas(value);
        }

        function totalSavings() {
            return GlobalUtils.numberWithCommas(GlobalUtils.parseDollarString(vm.totalTicketCost()) - vm.stateDetails.baseFee);
        }

        function totalTicketCost() {
            return GlobalUtils.numberWithCommas(parseInt(vm.ticketFine) +
                GlobalUtils.parseDollarString(vm.insuranceIncrease));
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
        $scope.$on('$viewContentLoaded', function(scope, stateName){
            console.log(stateName);
            if (stateName == "@default-template.state-info") {

                var onContentLoaded = function(stateName) {
                    var leftNav = $(".left-nav");
                    var contentNav = $('.content-nav');
                    var contentWrapper = $('.content-wrapper');
                    var leftNavHeight = leftNav.outerHeight();
                    var topNavHeight = $('.navbar').outerHeight();
                    var aboveHeight = $('.content-header').outerHeight();
                    var contentTopPadding = $(".content-body").css("padding-top").substr(0, 2);

                    var onScroll = function(stateName) {
                        var responsiveMode = $(window).width() < 768;

                        if ($(window).scrollTop() > aboveHeight) {
                            if (stateName != "@default-template.state-info") {
                                return;
                            }

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
                    };
                    $(window).scroll(onScroll(stateName));
                };
                $timeout(onContentLoaded(stateName));
            }
        });
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