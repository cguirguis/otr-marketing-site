(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('DefaultTemplateCtrl', DefaultTemplateCtrl);


    DefaultTemplateCtrl.$inject = ['ENV', '$rootScope', '$timeout', '$http', '$q', 'GlobalUtils', 'OtrService', 'FileService', 'DataService', 'CacheService', '$uibModal'];
    function DefaultTemplateCtrl(ENV, $rootScope, $timeout, $http, $q, GlobalUtils, OtrService, FileService, DataService, CacheService, $uibModal) {
        var vm = this,

            URLS = {
                POST_SUBSCRIPTION: ENV.apiEndpoint + '/api/v1/subscribe'
            };

        var otrService = null;
        var exitPopupLoaded = false;

        vm.isMobileDevice = GlobalUtils.isMobileDevice();
        vm.session = CacheService;

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
                if (vm.isMobileDevice || window.outerWidth < 768) {
                    $("#menu-item-12").toggleClass("hover");
                }
            });

            navbarToggle.click(function(event) {
                $("ul#menu-main-menu").parent().toggle();

                if (window.outerWidth > 768) {
                    event.stopPropagation();
                    return;
                }

                var getStartedContainer = $(".get-started-container")[0];
                if (getStartedContainer) {
                    var zIndex = getStartedContainer.style ? parseInt(getStartedContainer.style.zIndex) : 1;
                    zIndex = !zIndex ? 1 : zIndex;
                    getStartedContainer.style.zIndex = -1 * zIndex;
                }
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
                        delay: 5,
                        cookieExp: 1
                    });
                    exitPopupLoaded = true;
                }
            }, 3000);

            // Attempt to get current user info
            getUserInfo();
        });

        // ----- INTERFACE ------------------------------------------------------------
        vm.login = login;
        vm.logout = logout;
        vm.submitSubscribeForm = submitSubscribeForm;
        vm.formatStateName = formatStateName;
        vm.submitReviewRequest = submitReviewRequest;
        vm.isUploadSupported = isUploadSupported;

        // ----- PUBLIC METHODS -------------------------------------------------------

        (function initController() {
            console.log('----- Initializing DefaultTemplateCtrl -----');

            otrService = new OtrService({domain: ENV.apiEndpoint});
            $rootScope.otrService = otrService;
            vm.reviewRequested = false;

            FileService.initializeFileReaderHandler();

            vm.iTunesLinkForFooter = GlobalUtils.buildITunesLink('website', null, 'iOSBadge', 'footer', null);

            $rootScope.$on('BranchInitComplete', function(event, next, current) {
                console.log('BranchInitComplete event in DefaultTemplateCtrl.js: ', $rootScope.branchData);
                vm.iTunesLinkForFooter = GlobalUtils.buildITunesLink('website', '', 'iOSBadge', 'footer', '');
            });
        })();

        function isUploadSupported() {
            if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
                return false;
            }
            var elem = document.createElement('input');
            elem.type = 'file';

            return !elem.disabled;
        }

        function submitReviewRequest(isFormValid, isReviewPage) {
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
                    usage : !isReviewPage ? 'OTR_EXIT_POPUP' : 'TICKET_REVIEW_PAGE',
                    notificationMethod : 'EMAIL',
                    keyValueMap : {
                        name: vm.exitPopupName,
                        contact: vm.exitPopupContactInfo
                    }
                }
            };

            // Include citation image URL if user uploaded an image
            if (vm.hasTicket && $rootScope.citation) {
                if ($rootScope.citation && !$rootScope.citation.ticketImageUrl) {
                    // Wait for async citation upload to complete
                    $timeout(function(d) {
                        submitReviewRequest(isFormValid);
                    }, 1500);
                    return;
                } else {
                    params.request.keyValueMap.ticketImage = $rootScope.citation.ticketImageUrl;
                    params.request.keyValueMap.citationId = $rootScope.citation.citationId;
                }
            }

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

        // TODO - think about moving these inside a service
        function login() {
            $rootScope.trackFBButtonConversion('SignUp', 'MenuBar');
            vm.fightTicketRedirect();
        }

        function logout(callback) {
            DataService.logout()
                .then(function(response) {
                    if (vm.session.model.fbAuth) {
                        FB.logout(function(response) {
                            // Person is now logged out
                            vm.session.model.fbAuth = null;
                            console.log("Logged out of Facebook");
                        });
                    }

                    vm.session.model.currentUser = null;
                    vm.session.model.citation = null;
                    vm.session.model.case = null;

                    if (callback) {
                        callback();
                    }

                    console.log("Logged out of app.");
                });
        }

        function getUserInfo() {
            // Attempt to get user info
            DataService.getUser().then(
                function(response) {
                    vm.session.model.currentUser = response.data.user;
                },
                function () {
                    // User is not logged in
                    vm.session.model.currentUser = null;
                }
            );
        }

        // TODO - Find a better place to put this
        $rootScope.showLoginModal = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/login.html',
                controller: 'LoginCtrl as vm',
                size: 'md',
                resolve: {
                    user: function () {
                        return null;
                    }
                }
            });

            modalInstance.result.then(
                function (currentUser) {
                    vm.session.model.currentUser = currentUser;
                },
                function () {
                    console.log('Modal dismissed at: ' + new Date());
                }
            );
        };

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