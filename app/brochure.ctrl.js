(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('BrochureCtrl', BrochureCtrl)
        .controller('LawyerFormModalCtrl', LawyerFormModalCtrl);

    BrochureCtrl.$inject = ['ENV', '$http', '$q', '$modal', '$log'];
    function BrochureCtrl(ENV, $http, $q, $modal, $log) {
        var vm = this,

            URLS = {
                POST_SUBSCRIPTION: ENV.apiEndpoint + '/api/v1/subscribe',
                POST_LAWYER_LEAD: ENV.apiEndpoint + '/api/v1/lawyers/lead'

            };

        // ----- INTERFACE ------------------------------------------------------------
        vm.saveContactInfo = saveContactInfo;
        vm.submitSubscribeForm = submitSubscribeForm;
        vm.openLawyerFormModal = openLawyerFormModal;


        // ----- PUBLIC METHODS -------------------------------------------------------

        function openLawyerFormModal(size) {
            console.log('opening the modal');

            var modalInstance = $modal.open({
                animation:      true,
                backdrop:       'static',
                templateUrl:    'lawyerInfoRequest.html',
                controller:     'LawyerFormModalCtrl as lawyerFormCtrl',
                size:           size,
                resolve: {
                    urls: function() {
                        return URLS;
                    }
                }
            });

            modalInstance.result
                .then(
                    function (request) {
                        $log.info('LawyerFormModal closed at: ' + new Date());
                    },
                    function (message) {
                        $log.info('LawyerFormModal dismissed at: ' + new Date() + ' (message: ' + message + ')');
                    }
            );

        }

        function saveContactInfo(isValid) {
            console.log('Attempting to save contact info');
            vm.dataLoading = true;
            vm.submitted = true;
            vm.launchFormSuccess = false;
            vm.launchFormResponseReceived = false;

            // Only continue if the login form is valid
            if (!isValid) {
                console.log('errors on form');
                vm.dataLoading = false;
                return;
            }

            // Make the call to save the info
            var dataObj = {
                subscriber : {
                    fullName : vm.fullName,
                    email : vm.email,
                    postalCode : vm.zipcode,
                    subscriptionType : 'WEB_BROCHURE_LAUNCH_NOTIFICATION'
                }
            };
			
			vm.formName = "contact";
			
			postSubscriberData(dataObj);
        }
		
        function submitSubscribeForm(isValid) {
            vm.subscribeFormDataLoading = true;
            vm.subscribeFormSubmitted = true;
            vm.subscribeFormSuccess = false;
            vm.subscribeFormResponseReceived = false;

            // Only continue if the form is valid
            if (!isValid) {
                console.log('errors on form');
                vm.subscribeFormDataLoading = false;
                return;
            }

            // Make the call to save the info
            var dataObj = {
                subscriber : {
                    fullname : '',
                    email : vm.subscribeForm_email,
                    postalCode : vm.subscribeForm_zip,
                    subscriptionType : 'WEB_BROCHURE_LAUNCH_NOTIFICATION'
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
							console.log('successfully subscribed user: ', response);
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
							console.log('failed to subscribe user: ', error);
							vm.launchFormResponseReceived = true;
							vm.launchFormSuccess = false;
							vm.dataLoading = false;
						} else {
							vm.subscribeFormResponseReceived = true;
							vm.subscribeFormSuccess = false;
							vm.subscribeFormDataLoading = false;
						}
                        if (error.data && error.data.error) {
                            return $q.reject(error.data.error.uiErrorMsg);
                        }
                        return $q.reject('Bummer! Something strange is going on and we were not able to save your info. Please try again or let us know if this keeps happening!');
                    }
                )
		}
    }


    /**
     * This controller is specifically for the "LawyerFormModal" modal popup.
     *
     */
    LawyerFormModalCtrl.$inject = ['$scope', '$log', '$modalInstance', '$http', '$q', 'urls'];
    function LawyerFormModalCtrl($scope, $log, $modalInstance, $http, $q, urls) {

        var lawyerFormCtrl = this;
        lawyerFormCtrl.dataLoading = false;

        lawyerFormCtrl.request = {
            ref : 'web_brochure'
        };

        lawyerFormCtrl.ok = function (isValid) {
            lawyerFormCtrl.dataLoading = true;
            lawyerFormCtrl.lawyerLeadFormSubmitted = true;
            lawyerFormCtrl.message = '';

            // Only continue if the form is valid
            if (!isValid) {
                console.log('errors on form');
                lawyerFormCtrl.dataLoading = false;
                return;
            }

            $http.post(urls.POST_LAWYER_LEAD, lawyerFormCtrl.request)
                .then(
                    function (response) {
                        console.log('successfully saved lawyer lead: ', response);
                        lawyerFormCtrl.lawyerLeadFormResponseReceived = true;
                        lawyerFormCtrl.lawyerLeadFormSuccess = true;
                        lawyerFormCtrl.dataLoading = false;
                    },
                    function (error) {
                        console.log('failed to save lawyer lead: ', error);
                        lawyerFormCtrl.lawyerLeadFormResponseReceived = true;
                        lawyerFormCtrl.lawyerLeadFormSuccess = false;
                        lawyerFormCtrl.dataLoading = false;
                        if (error.data && error.data.error) {
                            return $q.reject(error.data.error.uiErrorMsg);
                        }
                        return $q.reject('Bummer! Something strange is going on and we were not able to save your info. Please try again or let us know if this keeps happening!');
                    }
            )

        };

        lawyerFormCtrl.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

})();