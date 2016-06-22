(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('DefaultTemplateCtrl', DefaultTemplateCtrl);


    DefaultTemplateCtrl.$inject = ['ENV', '$rootScope', '$cookies', '$filter', '$timeout', '$http', '$q', 'GlobalUtils', 'OtrService', 'FileService'];
    function DefaultTemplateCtrl(ENV, $rootScope, $cookies, $filter, $timeout, $http, $q, GlobalUtils, OtrService, FileService) {
        var vm = this,

            URLS = {
                POST_SUBSCRIPTION: ENV.apiEndpoint + '/api/v1/subscribe'
            };

        var otrService = null;
        var exitPopupLoaded = false;
        var iTunesBaseLink = 'http://fight.offtherecord.com/iosBadge?';
        vm.iTunesLink = iTunesBaseLink + '~channel=website&~feature=iOSBadge&~stage=footer&';

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
                        delay: 10,
                        cookieExp: 1
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
        vm.isUploadSupported = isUploadSupported;

        // ----- PUBLIC METHODS -------------------------------------------------------

        (function initController() {

            otrService = new OtrService({domain: ENV.apiEndpoint});
            $rootScope.otrService = otrService;
            vm.reviewRequested = false;

            FileService.initializeFileReaderHandler();

            $rootScope.$on('BranchInitComplete', function(event, next, current) {
                console.log('BranchInitComplete event: ', $rootScope.branchData);
                buildITunesLink();
            });

        })();

        function buildITunesLink() {

            console.log('isBranchLink: ', $rootScope.branchData.isBranchLink);

            if ($rootScope.branchData.isBranchLink) {
                var link = iTunesBaseLink;

                if ($rootScope.branchData.channel) {
                    link = link + '~channel=' + $rootScope.branchData.channel + '&';
                }
                if ($rootScope.branchData.campaign) {
                    link = link + '~campaign=' + $rootScope.branchData.campaign + '&';
                }
                if ($rootScope.branchData.feature) {
                    link = link + '~feature=' + $rootScope.branchData.feature + '&';
                }
                if ($rootScope.branchData.stage) {
                    link = link + '~stage=' + $rootScope.branchData.stage + '&';
                }
                if ($rootScope.branchData.tags) {
                    link = link + '~tags=' + $rootScope.branchData.tags + ',iOSBadge,footer' + '&';
                }
                console.log('new link: ', link);
                vm.iTunesLink = link;
            }

            var ref2 = $cookies.get('otr-referrer');
            var ref1 = $cookies.getObject('otr-referrer');

            console.log('ref1: ', ref1);
            console.log('ref2: ', ref2);

            if (ref1) {
                var ref1clean = $filter('encodeUri')(ref1);
                console.log('ref1clean', ref1clean);
                vm.iTunesLink = vm.iTunesLink + 'referrer=' + ref1clean;
            }

            console.log('iTunes Link: ', vm.iTunesLink);

        }

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