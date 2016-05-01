(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('DefaultTemplateCtrl', DefaultTemplateCtrl);


    DefaultTemplateCtrl.$inject = ['ENV', '$window', '$rootScope', '$scope', '$timeout', '$http', '$q', 'GlobalUtils'];
    function DefaultTemplateCtrl(ENV, $window, $rootScope, $scope, $timeout, $http, $q, GlobalUtils) {
        var vm = this,

            URLS = {
                POST_SUBSCRIPTION: ENV.apiEndpoint + '/api/v1/subscribe'
            };

        $rootScope.defaultStateValues = {
            backgroundImgUrl : 'assets/img/states/default.jpg',
            baseFee : 250,
            successRate : 95,
            avgFine : 180
        }

        $rootScope.statesList = [
            {
                "name": "Alabama",
                "abbreviation": "AL"
            },
            {
                "name": "Alaska",
                "abbreviation": "AK"
            },
            {
                "name": "Arizona",
                "abbreviation": "AZ"
            },
            {
                "name": "Arkansas",
                "abbreviation": "AR"
            },
            {
                "name": "California",
                "abbreviation": "CA",
                backgroundImgUrl : 'assets/img/states/CA.jpg',
                baseFee : 300,
                successRate : 93,
                avgFine : 207
            },
            {
                "name": "Colorado",
                "abbreviation": "CO"
            },
            {
                "name": "Connecticut",
                "abbreviation": "CT"
            },
            {
                "name": "Delaware",
                "abbreviation": "DE"
            },
            {
                "name": "Florida",
                "abbreviation": "FL"
            },
            {
                "name": "Georgia",
                "abbreviation": "GA"
            },
            {
                "name": "Hawaii",
                "abbreviation": "HI"
            },
            {
                "name": "Idaho",
                "abbreviation": "ID"
            },
            {
                "name": "Illinois",
                "abbreviation": "IL"
            },
            {
                "name": "Indiana",
                "abbreviation": "IN"
            },
            {
                "name": "Iowa",
                "abbreviation": "IA"
            },
            {
                "name": "Kansas",
                "abbreviation": "KS"
            },
            {
                "name": "Kentucky",
                "abbreviation": "KY"
            },
            {
                "name": "Louisiana",
                "abbreviation": "LA"
            },
            {
                "name": "Maine",
                "abbreviation": "ME"
            },
            {
                "name": "Maryland",
                "abbreviation": "MD"
            },
            {
                "name": "Massachusetts",
                "abbreviation": "MA"
            },
            {
                "name": "Michigan",
                "abbreviation": "MI"
            },
            {
                "name": "Minnesota",
                "abbreviation": "MN"
            },
            {
                "name": "Mississippi",
                "abbreviation": "MS"
            },
            {
                "name": "Missouri",
                "abbreviation": "MO"
            },
            {
                "name": "Montana",
                "abbreviation": "MT"
            },
            {
                "name": "Nebraska",
                "abbreviation": "NE"
            },
            {
                "name": "Nevada",
                "abbreviation": "NV"
            },
            {
                "name": "New Hampshire",
                "abbreviation": "NH"
            },
            {
                "name": "New Jersey",
                "abbreviation": "NJ"
            },
            {
                "name": "New Mexico",
                "abbreviation": "NM"
            },
            {
                "name": "New York",
                "abbreviation": "NY",
                backgroundImgUrl : 'assets/img/states/NY.jpg',
                baseFee : 200,
                successRate : 95,
                avgFine : 180
            },
            {
                "name": "North Carolina",
                "abbreviation": "NC"
            },
            {
                "name": "North Dakota",
                "abbreviation": "ND"
            },
            {
                "name": "Ohio",
                "abbreviation": "OH"
            },
            {
                "name": "Oklahoma",
                "abbreviation": "OK",
                backgroundImgUrl : 'assets/img/states/OK.jpg',
                baseFee : 200,
                successRate : 96,
                avgFine : 180
            },
            {
                "name": "Oregon",
                "abbreviation": "OR",
                backgroundImgUrl : 'assets/img/states/OR.jpg',
                baseFee : 350,
                successRate : 88,
                avgFine : 270
            },
            {
                "name": "Pennsylvania",
                "abbreviation": "PA"
            },
            {
                "name": "Rhode Island",
                "abbreviation": "RI"
            },
            {
                "name": "South Carolina",
                "abbreviation": "SC"
            },
            {
                "name": "South Dakota",
                "abbreviation": "SD"
            },
            {
                "name": "Tennessee",
                "abbreviation": "TN"
            },
            {
                "name": "Texas",
                "abbreviation": "TX",
                backgroundImgUrl : 'assets/img/states/TX.jpg',
                baseFee : 200,
                successRate : 97,
                avgFine : 107
            },
            {
                "name": "Utah",
                "abbreviation": "UT"
            },
            {
                "name": "Vermont",
                "abbreviation": "VT"
            },
            {
                "name": "Virginia",
                "abbreviation": "VA"
            },
            {
                "name": "Washington",
                "abbreviation": "WA",
                backgroundImgUrl : 'assets/img/states/WA.jpg',
                baseFee : 200,
                successRate : 97,
                avgFine : 180
            },
            {
                "name": "West Virginia",
                "abbreviation": "WV"
            },
            {
                "name": "Wisconsin",
                "abbreviation": "WI"
            },
            {
                "name": "Wyoming",
                "abbreviation": "WY"
            }
        ];

        vm.isMobileDevice = GlobalUtils.isMobileDevice();

        $(document).ready(function () {

            var navbarToggle = $("button.navbar-toggle");

            $("ul#menu-main-menu li:not(#menu-item-12)").click(function() {
                if (vm.isMobileDevice) {
                    $("ul#menu-main-menu").parent().hide();
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
        });

        // ----- INTERFACE ------------------------------------------------------------
        vm.fightTicketRedirect = fightTicketRedirect;
        vm.login = login;
        vm.submitSubscribeForm = submitSubscribeForm;
        vm.formatStateName = formatStateName;


        // ----- PUBLIC METHODS -------------------------------------------------------

        function fightTicketRedirect() {

            var appUrl = GlobalUtils.getAppUrl();

            $timeout(function() {
                $window.location.href= appUrl;
            });
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