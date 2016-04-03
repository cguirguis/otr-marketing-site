(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('DefaultTemplateCtrl', DefaultTemplateCtrl);


    DefaultTemplateCtrl.$inject = ['ENV', '$window', '$timeout', '$http', '$q', 'GlobalUtils'];
    function DefaultTemplateCtrl(ENV, $window, $timeout, $http, $q, GlobalUtils) {
        var vm = this,

            URLS = {
                POST_SUBSCRIPTION: ENV.apiEndpoint + '/api/v1/subscribe'
            };

        vm.isMobileDevice = GlobalUtils.isMobileDevice();

        // ----- TODO: Need to move this back in the view -----------------------------
        $("ul#menu-main-menu li").click(function() {
            if (isMobileDevice) {
                $(this).parent().parent().hide();
            }
        });
        $("button.navbar-toggle").click(function() {
            $("ul#menu-main-menu").parent().toggle();
        });

        // ----- INTERFACE ------------------------------------------------------------
        vm.fightTicketRedirect = fightTicketRedirect;
        vm.submitSubscribeForm = submitSubscribeForm;


        // ----- PUBLIC METHODS -------------------------------------------------------

        function fightTicketRedirect() {

            var appUrl = GlobalUtils.getAppUrl();

            $timeout(function() {
                $window.location.href= appUrl;
            });
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

    }


})();