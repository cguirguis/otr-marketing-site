(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('BrochureCtrl', BrochureCtrl)
        .controller('LawyerFormModalCtrl', LawyerFormModalCtrl);

    BrochureCtrl.$inject = ['ENV', '$http', '$q', '$modal', '$log', '$timeout', '$window', '$location'];
    function BrochureCtrl(ENV, $http, $q, $modal, $log, $timeout, $window, $location) {
        var vm = this,

            URLS = {
                POST_SUBSCRIPTION: ENV.apiEndpoint + '/api/v1/subscribe',
                POST_LAWYER_LEAD: ENV.apiEndpoint + '/api/v1/lawyers/lead'

            };

        // ----- INTERFACE ------------------------------------------------------------
        vm.saveContactInfo = saveContactInfo;
        vm.submitSubscribeForm = submitSubscribeForm;
        vm.openLawyerFormModal = openLawyerFormModal;
        vm.fightTicket = fightTicket;


        // ----- PUBLIC METHODS -------------------------------------------------------

        function openLawyerFormModal(size) {
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

        function fightTicket() {
            var appUrl = "https://itunes.apple.com/us/app/off-record-fight-your-traffic/id1032930471?mt=8";

            if (!iOS()) {
                appUrl = showMobileWebApp()
                    ? "https://m.offtherecord.com"
                    : "https://me.offtherecord.com";
            }

            $timeout(function() {
                $window.location.href= appUrl; 
            });
        }

        // This is for drivers/defendants.

        function saveContactInfo(isValid) {
            vm.dataLoading = true;
            vm.submitted = true;
            vm.launchFormSuccess = false;
            vm.launchFormResponseReceived = false;

            // Only continue if the login form is valid
            if (!isValid) {
                vm.dataLoading = false;
                return;
            }

            // Make the call to save the info
            var dataObj = {
                subscriber : {
                    fullName : vm.fullName,
                    email : vm.email,
                    postalCode : vm.zipcode,
                    subscriptionType : 'WEB_BROCHURE_LAUNCH_NOTIFICATION',
                    roleType: 'DEFENDANT'
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

        function showMobileWebApp() {
            var isMobileDevice = false;
            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))isMobileDevice = true})(navigator.userAgent||navigator.vendor||window.opera);

            return isMobileDevice || window.innerWidth <= 800;
        }

        function iOS() {
            var iDevices = [
                'iPad Simulator',
                'iPhone Simulator',
                'iPod Simulator',
                'iPad',
                'iPhone',
                'iPod'
            ];

            if (!!navigator.platform) {
                while (iDevices.length) {
                    if (navigator.platform === iDevices.pop()){ return true; }
                }
            }

            return false;
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
                lawyerFormCtrl.dataLoading = false;
                return;
            }

            $http.post(urls.POST_LAWYER_LEAD, lawyerFormCtrl.request)
                .then(
                    function (response) {
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