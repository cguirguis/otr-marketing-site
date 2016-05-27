(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('HomeCtrl', HomeCtrl)
        .controller('LawyerFormModalCtrl', LawyerFormModalCtrl);


    HomeCtrl.$inject = ['ENV', '$window', '$rootScope', '$http', '$q', '$uibModal', '$log', '$timeout', 'GlobalUtils'];
    function HomeCtrl(ENV, $window, $rootScope, $http, $q, $uibModal, $log, $timeout, GlobalUtils) {
        var vm = this,
            //isMobileDevice = GlobalUtils.isMobileDevice(),

            URLS = {
                POST_LAWYER_LEAD: ENV.apiEndpoint + '/api/v1/lawyers/lead'
            };

        vm.iTunesLink = 'http://fight.offtherecord.com/ios-app-store?';

        // ----- INTERFACE ------------------------------------------------------------
        //vm.saveContactInfo = saveContactInfo;
        vm.openLawyerFormModal = openLawyerFormModal;

        // ----- PUBLIC METHODS -------------------------------------------------------

        (function init() {

            $rootScope.$on('BranchInitComplete', function(event, next, current) {
                console.log('branch data: ', $rootScope.branchData);
                buildITunesLink();
            });

        })();

        function buildITunesLink() {

            console.log('building iTunes link');
            var link = 'http://fight.offtherecord.com/ios-app-store?';

            if ($rootScope.branchData.channel) {
                link = link + 'channel=' + $rootScope.branchData.channel + '&';
            }
            if ($rootScope.branchData.campaign) {
                link = link + 'campaign=' + $rootScope.branchData.campaign + '&';
            }
            if ($rootScope.branchData.feature) {
                link = link + 'feature=' + $rootScope.branchData.feature + '&';
            }
            if ($rootScope.branchData.stage) {
                link = link + 'stage=' + $rootScope.branchData.stage + '&';
            }
            if ($rootScope.branchData.tags) {
                link = link + 'tags=' + $rootScope.branchData.tags + ',iTunesBadgeButton' + '&';
            }

            console.log('new link: ', link);
            vm.iTunesLink = link;
        }

        function openLawyerFormModal(size) {
            var modalInstance = $uibModal.open({
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

        //function saveContactInfo(isValid) {
        //    vm.dataLoading = true;
        //    vm.submitted = true;
        //    vm.launchFormSuccess = false;
        //    vm.launchFormResponseReceived = false;
        //
        //    // Only continue if the login form is valid
        //    if (!isValid) {
        //        vm.dataLoading = false;
        //        return;
        //    }
        //
        //    // Make the call to save the info
        //    var dataObj = {
        //        subscriber : {
        //            fullName : vm.fullName,
        //            email : vm.email,
        //            postalCode : vm.zipcode,
        //            subscriptionType : 'WEB_BROCHURE_LAUNCH_NOTIFICATION',
        //            roleType: 'DEFENDANT'
        //        }
        //    };
			//
			//vm.formName = "contact";
			//
			//postSubscriberData(dataObj);
        //}
    }

    /**
     * This controller is specifically for the "LawyerFormModal" modal popup.
     *
     */
    LawyerFormModalCtrl.$inject = ['$scope', '$log', '$uibModalInstance', '$http', '$q', 'urls'];
    function LawyerFormModalCtrl($scope, $log, $uibModalInstance, $http, $q, urls) {

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
            $uibModalInstance.dismiss('cancel');
        };
    };

})();