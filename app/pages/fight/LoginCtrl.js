(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('LoginCtrl', LoginCtrl);

    LoginCtrl.$inject = ['$rootScope', '$scope', 'ENV', 'DataService', 'OtrService', 'CacheService', 'FacebookService', '$uibModalInstance'];
    function LoginCtrl($rootScope, $scope, ENV, DataService, OtrService, CacheService, FacebookService, $uibModalInstance) {
        var vm = this;

        vm.dataLoading = false;
        vm.showLoginOptions = true;
        vm.extraInfo = {};
        vm.session = CacheService;

        (function initController() {
            $scope.$on('$viewContentLoaded', function() {
                vm.otrService = $rootScope.otrService || new OtrService({domain: ENV.apiEndpoint});

                vm.showLoginOptions = true;
                vm.showEmailLogin = false;
                vm.showSignup = false;
                vm.dataLoading = false;
                $("#signup-form input").val("");
                $(".email-login-form input").val("");

                getReferralSources();
            });
        })();

        vm.ok = function () {
            vm.dataLoading = false;

            $rootScope.$emit('user:logged-in');

            $uibModalInstance.close(vm.session.model.currentUser);
        };

        vm.cancel = function () {
            vm.dataLoading = false;
            $uibModalInstance.dismiss('cancel');
        };

        vm.loginWithEmail = function() {
            vm.showLoginOptions = false;
            vm.showEmailLogin = true;
            vm.loginModalTitle = "Log in";
        };

        vm.signup = function() {
            vm.showLoginOptions = false;
            vm.showSignup = true;
            vm.loginModalTitle = "Sign up";
        };

        vm.cancelEmailLogin = function() {
            vm.showLoginOptions = true;
            vm.showEmailLogin = false;
            vm.errorMessage = "";
        };

        vm.cancelSignup = function() {
            vm.showLoginOptions = true;
            vm.showSignup = false;
            vm.errorMessage = "";
        };

        vm.submitReferralInfo = function() {
            if(vm.selectedSource.sourceTypeId) {
                var params = {
                    request : {
                        referralCode: vm.extraInfo.referralCode,
                        referralSourceData: $rootScope.branchData,
                        userId: $rootScope.user.userId,
                        userReferralSourceTypeId: vm.selectedSource.sourceTypeId
                    }
                };

                vm.otrService.setReferralSourceUsingPOST(params)
                    .then(function(response) {
                        // TODO - hide referral modal/options
                    });
            } else {
                // TODO - hide referral modal/options
            }
        };

        vm.loginWithFacebook = function() {
            FacebookService.login(function(response) {
                FacebookService.statusChangeCallback(response)
                    .then(function(response) {
                        console.log('FB login response, ', response);

                        vm.ok();

                        if(response.newAccount) {
                            getReferralSources()
                                .then(function(response) {
                                    vm.referralSources = _.filter(response.data.sources, function(obj) {
                                        return obj.isDisplayed;
                                    });
                                    // TODO - show referral modal/options
                                });
                        }
                    }, function(error) {
                        vm.cancel();
                    });
            });
        };

        vm.submitSignupForm = function(newUser) {

            var metaData = {},
                newUser = newUser || {};

            if (vm.selectedSource && vm.selectedSource.sourceTypeId) {
                metaData.sourceTypeId = vm.selectedSource.sourceTypeId;
            }
            if (newUser.referralCode) {
                metaData.referralCode = newUser.referralCode;
            }

            vm.dataLoading = true;
            vm.errorMessage = "";

            if (!newUser || !newUser.firstname || !newUser.firstname.length) {
                vm.errorMessage = "Please enter a first name.";
                vm.dataLoading = false;
                return;
            } else if (!newUser.lastname || !newUser.lastname.length) {
                vm.errorMessage = "Please enter a last name.";
                vm.dataLoading = false;
                return;
            } else if (!newUser.emailAddress || !newUser.emailAddress.length) {
                vm.errorMessage = "Please enter an email address.";
                vm.dataLoading = false;
                return;
            } else if (!newUser.password || !newUser.password.length) {
                vm.errorMessage = "Please enter a password.";
                vm.dataLoading = false;
                return;
            }

            metaData.referralSourceData = $rootScope.branchData;

            DataService.signup(newUser, metaData)
                .error(function(data, status, headers, config) {
                    if (data) {
                        console.log("Error: " + data.error.uiErrorMsg);
                        vm.errorMessage = data.error.uiErrorMsg;
                    }
                    vm.dataLoading = false;
                })
                .then(signupResponseHandler);
        };

        vm.submitEmailLoginForm = function(email, password) {
            vm.errorMessage = "";

            if (!email.length || !password.length) {
                vm.errorMessage = "Please provide a valid email and password.";
            } else {
                vm.dataLoading = true;
                $rootScope.preventLoadingModal = true;
                DataService.login(email, password)
                    .error(function(data, status, headers, config) {
                        vm.errorMessage = data && data.error ? data.error.uiErrorMsg : "Unable to log in.";
                        vm.dataLoading = false;
                    })
                    .then(loginResponseHandler);
            }
        };

        var signupResponseHandler = function(response) {
            $rootScope.user = response.data.user;

            vm.ok();
        };

        var loginResponseHandler = function(response) {
            // Logged in successfully
            vm.session.model.currentUser = {}; // (user info doesn't come back in this response)

            // Now get user info
            DataService.getUser()
                .then(function(response) {
                    vm.session.model.currentUser = response.data.user;
                });

            vm.ok();
        };

        vm.updateSelectedSource = function(value) {
            vm.selectedSource = value;
            vm.showReferralCode = value.sourceTypeId == 3 ? true : false;
        };

        function getReferralSources() {
            DataService.getReferralSources().then(
                function(response) {
                    vm.selectedSource = {};
                    vm.referralSources = response.data.sources.filter(function(e) {
                        return e.isDisplayed == true;
                    });
                }
            );
        }
    }
})();