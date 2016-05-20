(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('DefaultTemplateCtrl', DefaultTemplateCtrl);


    DefaultTemplateCtrl.$inject = ['ENV', '$window', '$rootScope', '$scope', '$timeout', '$http', '$q', 'GlobalUtils', 'OtrService'];
    function DefaultTemplateCtrl(ENV, $window, $rootScope, $scope, $timeout, $http, $q, GlobalUtils, OtrService) {
        var vm = this,

            URLS = {
                POST_SUBSCRIPTION: ENV.apiEndpoint + '/api/v1/subscribe'
            };

        var otrService = null;
        var exitPopupLoaded = false;

        vm.isMobileDevice = GlobalUtils.isMobileDevice();

        $(document).ready(function () {

            // Generate mobile app link based on screen size
            $rootScope.mobileAppUrl = GlobalUtils.getAppUrl();

            var navbarToggle = $("button.navbar-toggle");

            $("ul#menu-main-menu li:not(#menu-item-12)").click(function() {
                if (vm.isMobileDevice) {
                    $("ul#menu-main-menu").parent().hide();
                }
            });

            $("ul#menu-main-menu li#menu-item-12").click(function() {
                if (vm.isMobileDevice) {
                    $("#menu-item-12").toggleClass("hover");
                }
            });

            navbarToggle.click(function(event) {
                $("ul#menu-main-menu").parent().toggle();
                event.stopPropagation();
            });

            var fightNavItem = $('#menu-item-12');
            fightNavItem.mouseover(function() {
                fightNavItem.addClass("hover");
                if (vm.isMobileDevice) {
                    //$("html").css('overflow', 'hidden');
                }
            });

            $('.nav-list').click(function(event) {
                fightNavItem.removeClass("hover");
                $("ul#menu-main-menu").parent().toggle();
                $("html").css('overflow', 'visible');
                event.stopPropagation();
            });

            $('#menu-item-12, .nav-list').mouseleave(function() {
                fightNavItem.removeClass("hover");
                $("html").css('overflow', 'visible');
            });

            // Closes the Responsive Menu on Menu Item Click
            $('.navbar-collapse ul li a').click(function(event) {
                $('.navbar-toggle').click();
                $(".navbar-ex1-collapse").attr("style", "display:none");
                $(".navbar-ex1-collapse").removeClass("in");
            });

            $timeout(function() {
                if (!exitPopupLoaded) {
                    bioEp.init({
                        fonts: ['//fonts.googleapis.com/css?family=Titillium+Web:300,400,600'],
                        cookieExp: 2
                    });
                    exitPopupLoaded = true;
                }
            }, 1000);
        });

        // ----- INTERFACE ------------------------------------------------------------
        vm.login = login;
        vm.submitSubscribeForm = submitSubscribeForm;
        vm.formatStateName = formatStateName;
        vm.submitReviewRequest = submitReviewRequest;

        // ----- PUBLIC METHODS -------------------------------------------------------

        (function initController() {

            otrService = new OtrService({domain: ENV.apiEndpoint})
            vm.reviewRequested = false;

        })();

        function submitReviewRequest(isFormValid) {
            vm.ticketReviewRequestFormSubmitted = true;

            if (!isFormValid) {
                if (!vm.exitPopupName) {
                    $('.review-form').addClass('name-missing');
                } else {
                    $('.review-form').removeClass('name-missing');
                    $('.review-form').addClass('contact-missing');
                }
                return;
            }

            $('.review-form').removeClass('contact-missing');
            $('.review-form').removeClass('name-missing');

            vm.submitReviewRequestLoading = true;

            var params = {
                request : {
                    usage : 'OTR_EXIT_POPUP',
                    notificationMethod : 'EMAIL',
                    keyValueMap : {
                        name: vm.exitPopupName,
                        contact: vm.exitPopupContactInfo
                    }
                }
            };

            otrService.submitInternalNotificationUsingPOST(params)
                .then(
                    function(response) {
                        vm.reviewRequested = true;
                        vm.submitReviewRequestLoading = false;
                        console.log('success: ', response);
                        // Hide the popup
                        //$timeout(function(){
                        //    bioEp.hidePopup();
                        //}, 3000);
                    },
                    function(error) {
                        vm.submitReviewRequestFailed = true;
                        vm.submitReviewRequestLoading = false;
                        console.log('error: ', error);
                        $q.reject(error);
                    }
                );
        }

        function login() {
            $rootScope.trackFBButtonConversion('SignUp', 'MenuBar');
            vm.fightTicketRedirect();
        }

        function submitSubscribeForm(isValid) {
            vm.subscribeFormDataLoading = true;
            vm.subscribeFormSubmitted = true;
            vm.subscribeFormSuccess = false;
            vm.subscribeFormResponseReceived = false;

            // Only continue if the form is valid
            if (!isValid) {
                vm.subscribeFormDataLoading = false;
                return;
            }

            // Make the call to save the info
            var dataObj = {
                subscriber : {
                    fullname : '',
                    email : vm.subscribeForm_email,
                    postalCode : vm.subscribeForm_zip,
                    subscriptionType : 'WEB_BROCHURE_LAUNCH_NOTIFICATION',
                    roleType: 'DEFENDANT'
                }
            };

            vm.formName = "subscribe";

            postSubscriberData(dataObj);
        }

        function postSubscriberData(dataObj) {
            $http.post(URLS.POST_SUBSCRIPTION, dataObj)
                .then(
                function (response) {
                    if (vm.formName === "contact") {
                        vm.launchFormResponseReceived = true;
                        vm.launchFormSuccess = true;
                        vm.dataLoading = false;

                        // clear form
                        vm.submitted = false;
                        vm.fullname = '';
                        vm.email = '';
                        vm.zipcode = '';
                    } else {
                        vm.subscribeFormResponseReceived = true;
                        vm.subscribeFormSuccess = true;
                        vm.subscribeFormDataLoading = false;
                        vm.subscribeFormSubmitted = false;
                        vm.subscribeForm_email = '';
                        vm.subscribeForm_zip = '';
                    }
                },
                function (error) {
                    if (vm.formName === "contact") {
                        vm.launchFormResponseReceived = true;
                        vm.launchFormSuccess = false;
                        vm.dataLoading = false;
                    } else {
                        vm.subscribeFormResponseReceived = true;
                        vm.subscribeFormSuccess = false;
                        vm.subscribeFormDataLoading = false;
                    }
                    if (error.data && error.data.error) {
                        vm.subscribeErrorMsg = error.data.error.uiErrorMsg;
                        return $q.reject(error.data.error.uiErrorMsg);
                    } else {
                        vm.subscribeErrorMsg = 'Bummer! Something strange is going on and we were not able to save your info. Please try again or let us know if this keeps happening!';
                        return $q.reject(vm.subscribeErrorMsg);
                    }
                }
            )
        }

        function formatStateName(name) {
            return name.toLowerCase().replace(/ /g,'-');
        }
    }
})();