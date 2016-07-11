(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('LoginCtrl', LoginCtrl);

    LoginCtrl.$inject = ['$rootScope', '$scope', '$cookies', 'ENV', 'DataService', 'OtrService', 'CacheService', 'FacebookService', '$uibModalInstance'];
    function LoginCtrl($rootScope, $scope, $cookies, ENV, DataService, OtrService, CacheService, FacebookService, $uibModalInstance) {
        var vm = this;

        (function initController() {
            $scope.$on('$viewContentLoaded', function() {
                vm.otrService = $rootScope.otrService || new OtrService({domain: ENV.apiEndpoint});

                vm.showLoginOptions = true;
                vm.showEmailLogin = false;
                vm.showSignup = false;
                vm.dataLoading = false;
                vm.extraInfo = {};
                vm.isNewAccountWithFB = false;

                vm.session = CacheService;

                $("#signup-form input").val("");
                $(".email-login-form input").val("");

                vm.fetchUserReferralSources();
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
        };

        vm.signup = function() {
            vm.showLoginOptions = false;
            vm.showSignup = true;
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

        vm.fetchUserReferralSources = function() {
            vm.sources = [];
            vm.otrService.getUserReferralSourceTypesUsingGET()
                .then(function(response) {
                    vm.sources = _.filter(response.sources, function(element) {
                        return element.isDisplayed;
                    });
                });
        };

        vm.submitSourceInfo = function() {
            if (vm.selectedSource && vm.selectedSource.sourceTypeId) {
                var params = {
                    request : {
                        referralCode: vm.extraInfo.referralCode,
                        referralSourceData: $rootScope.branchData,
                        userId: vm.session.model.currentUser.userId,
                        userReferralSourceTypeId: vm.selectedSource.sourceTypeId
                    }
                };

                vm.dataLoading = true;
                vm.otrService.setReferralSourceUsingPOST(params)
                    .then(function(response) {
                        // TODO - hide referral modal/options
                    });
            } else {
                // TODO - hide referral modal/options
            }
        };

        vm.initiateFacebookLogin = function() {
            return FB.login(
                facebookAuthCallback,
                { scope: 'public_profile, email' }
            );
        };

        function facebookAuthCallback() {

            // Read Branch link data from cookie, if one is present.
            var newUserMeta = {};
            newUserMeta.referralSourceData = getBranchDataFromCookie();
            newUserMeta.httpReferrer = getReferrerFromCookie();

            FacebookService.statusChangeCallback(response, newUserMeta)
                .then(
                    function onLoginSuccess(response) {
                        console.log('Facebook login was successful, ', response);

                        vm.ok();

                        if (response.newAccount) {
                            fetchUserReferralSources();
                        }

                        // If this registration came from AdWords, Google will keep track of it
                        recordRegistrationConversionInAdwords();

                    }, function onLoginFailure(error) {
                        vm.cancel();
                    }
                );
        }

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

            metaData.referralSourceData = getBranchDataFromCookie();
            metaData.httpReferrer = getReferrerFromCookie();

            DataService.signup(newUser, metaData)
                .error(function(data, status, headers, config) {
                    if (data) {
                        console.log("Error: " + data.error.uiErrorMsg);
                        vm.errorMessage = data.error.uiErrorMsg;
                    }
                    vm.dataLoading = false;
                })
                .then(loginResponseHandler);
        };

        vm.submitEmailLoginForm = function(email, password) {
            vm.errorMessage = "";

            if (!email.length || !password.length) {
                vm.errorMessage = "Please provide a valid email and password.";
            } else {
                vm.dataLoading = true;
                DataService.login(email, password)
                    .error(function(data, status, headers, config) {
                        vm.errorMessage = data && data.error ? data.error.uiErrorMsg : "Unable to log in.";
                        vm.dataLoading = false;
                    })
                    .then(loginResponseHandler);
            }
        };

        vm.updateSelectedSource = function(value) {
            vm.selectedSource = value;
            vm.showReferralCode = value.sourceTypeId == 3 ? true : false;
        };

        function loginResponseHandler(response) {

            // If this registration came from AdWords, Google will keep track of it
            recordRegistrationConversionInAdwords();

            // Logged in successfully
            vm.session.model.currentUser = null;

            // Now get user info
            DataService.getUser()
                .then(
                    function(response) {
                        vm.session.model.currentUser = response.data.user;
                    },
                    function (error) {
                        console.log('Error getting user info: ' + error);
                    }
                );

            vm.ok();
        }

        function getBranchDataFromCookie() {
            var branchData = JSON.parse($cookies.get('branch-link') || "{}");
            console.log('branchData: ', branchData);
            return branchData;
        }

        function getReferrerFromCookie() {
            var httpReferrer = '';
            if ($cookies.get('otr-referrer')) {
                httpReferrer = JSON.parse($cookies.get('otr-referrer'));
            }

            console.log('httpReferrer: ', httpReferrer);
            return httpReferrer;
        }

        /* Fire off conversion tracking for the "Case Bookings from Web Clients" conversion action */
        function recordRegistrationConversionInAdwords() {
            window.google_trackConversion({
                google_conversion_id : 937085283,
                google_conversion_label : "cjfeCI3jrmUQ45LrvgM",
                google_remarketing_only : false,
                google_conversion_format : "3"
            });
        }
    }
})();