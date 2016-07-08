(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('HomeCtrl', HomeCtrl)
        .controller('LawyerFormModalCtrl', LawyerFormModalCtrl);


    HomeCtrl.$inject = ['$scope', '$timeout', 'ENV', '$state', '$rootScope', '$uibModal', '$log', 'GlobalUtils'];
    function HomeCtrl($scope, $timeout, ENV, $state, $rootScope, $uibModal, $log, GlobalUtils) {
        var vm = this,
            isMobileDevice = GlobalUtils.isMobileDevice(),

            URLS = {
                POST_LAWYER_LEAD: ENV.apiEndpoint + '/api/v1/lawyers/lead'
            };

        vm.errorMessage = "";

        // ----- INTERFACE ------------------------------------------------------------
        vm.openLawyerFormModal = openLawyerFormModal;
        vm.stateSearch = stateSearch;
        vm.goToState = goToState;

        // ----- PUBLIC METHODS -------------------------------------------------------

        (function init() {

            $scope.$on('$viewContentLoaded', function() {
                $timeout(function() {
                    var stateInput = angular.element("#state-input-field_value");
                    stateInput.on('click', function () {
                        if (isMobileDevice
                            && !stateInput.val().length
                            && window.innerHeight < 750) {
                            console.log("scroll down.");
                            window.scrollTo(0, $(".get-started-container").position().top - 5);
                        }
                    });
                });
            });

        })();

        function stateSearch(str) {
            var matches = [];
            $rootScope.statesList.forEach(function (state) {
                if ((state.name.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0) ||
                    (state.abbreviation.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0)) {
                    if (state.name.toLowerCase() === str.toString().toLowerCase()) {
                        vm.selectedState = state;
                        console.log(vm.selectedState.name);
                    }
                    matches.push(state);
                }
            });
            return matches;
        }

        function goToState(selectedState) {

            // console.log('selectedState: ', selectedState);

            if (!selectedState || !selectedState.originalObject) {
                vm.errorMessage = "Please enter a valid state";
                return;
            }

            if (selectedState.originalObject.abbreviation) {
                // console.log('state object already specified');
                // console.log('stateCode: ', selectedState.originalObject.abbreviation, ', stateName: ', selectedState.originalObject.name);
                selectedState = selectedState.originalObject;

            } else if (selectedState.originalObject.length == 2) {
                // A state code was typed in.
                // console.log('attempting to match with state abbreviation: ', selectedState.originalObject);
                selectedState = _.find($rootScope.statesList, { 'abbreviation' : selectedState.originalObject.toUpperCase() });
                // console.log('found matching state: ', selectedState);
            }
            else {
                // console.log('matching by state name: ', selectedState.originalObject);
                selectedState = _.find($rootScope.statesList, function(o) {
                    return o.name.toLowerCase() == selectedState.originalObject.toLowerCase();
                });
                // console.log('found matching state: ', selectedState);
            }

            if (selectedState) {
                vm.errorMessage = "";
                $state.go('default-template.state-info.fight', { stateCode: selectedState.abbreviation, stateName: selectedState.name });
            } else {
                vm.errorMessage = "Please enter a valid state";
            }

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
    }

})();