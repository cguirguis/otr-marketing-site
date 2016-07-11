(function () {
    'use strict';

    angular
        .module('brochure')
        .service('FacebookService', FacebookService);

    FacebookService.$inject = ['$q', '$rootScope', 'DataService'];
    function FacebookService ($q, $rootScope, DataService) {

        var statusChangeCallback = function(response, metaData) {
            // This is called with the results from from FB.getLoginStatus().

            if (response.status === 'connected') {
                // User is logged into Facebook and authorized for app
                return getUserInfo()
                    .then(function(userResponse) {
                        vm.session.model.currentUser = vm.session.model.currentUser || {};
                        vm.session.model.currentUser.firstname = userResponse.first_name;
                        vm.session.model.currentUser.lastname = userResponse.last_name;

                        // Authenticate user to our service
                        var data = {
                            "userAccessToken": response.authResponse.accessToken,
                            "expirationDate" : new Date(new Date().getTime() + (response.authResponse.expiresIn * 1000)),
                            "userID": response.authResponse.userID,
                            "referralSourceData": metaData.referralSourceData,
                            "httpReferrer": metaData.httpReferrer
                        };
                        return DataService.loginWithFacebook(data)
                            .then(function(response) {
                                // Now get user info
                                getProfilePhoto();
                                getUserNavPhoto();

                                DataService.getUser()
                                    .then(function(response) {
                                        vm.session.model.currentUser = response.data.user;
                                    });
                                $rootScope.$broadcast('user:logged-in');
                                return response;
                            });
                    })
                    .then(
                        function(otrResponse){
                            console.log("\n\nLogged in to OTR via Facebook.");
                            return otrResponse;
                        },
                        function(response) {
                            console.log(JSON.stringify(response.data.error.uiErrorMsg));
                            return $q.reject(response);
                        }
                    );
            }
            else if (response.status === 'not_authorized') {
                // The person is logged into Facebook, but not your app.
                //document.getElementById('status').innerHTML = 'Please log ' + 'into this app.';
                //FB.login()
                console.log("FB AUTH STATUS: not_authorized");
                return $q.reject("not_authorized");
            }
            else {
                // The person is not logged into Facebook, prompt them to login
                //FB.login();
                console.log("FB AUTH STATUS: not_connected");
                return $q.reject("not_connected");
            }
        };

        var getUserInfo = function() {
            var deferred = $q.defer();
            FB.api('/me', { fields: 'first_name, last_name, email' },
                function(response) {
                    if (!response || response.error) {
                        deferred.reject('Error occured');
                    } else {
                        deferred.resolve(response);
                    }
                });
            return deferred.promise;
        };

        var login = function(callback) {
            return FB.login(
                callback,
                { scope: 'public_profile, email' }
            );
        };

        var chromeLogin = function() {

            var ABSOLUTE_URI = "https://m-devo.offtherecord.com/fb-opener-handler.html";
            var FB_ID = "545669822241752";

            // Open your auth window containing FB auth page
            // with forward URL to your Opened Window handler page (below)
            var redirect_uri = "&redirect_uri=" + ABSOLUTE_URI;
            var scope = "&scope=public_profile,email";
            var url = "https://www.facebook.com/dialog/oauth?client_id=" + FB_ID + redirect_uri + scope;

            // notice the lack of other param in window.open
            // for some reason the opener is set to null
            // and the opened window can NOT reference it
            // if params are passed. #Chrome iOS Bug
            window.open(url, null);
        };

        function fbCompleteLogin(){
            FB.getLoginStatus(function(response) {
                // Calling this with the extra setting "true" forces
                // a non-cached request and updates the FB cache.
                // Since the auth login elsewhere validated the user
                // this update will now asyncronously mark the user as authed
            }, true);

        }

        var logout = function() {
            FB.logout(function(response) {
                vm.session.model.currentUser = {};
                vm.session.model.currentUser.isFbAuthed = false;
            });
        };

        var getProfilePhoto = function(width, height) {
            var width = width || 200;
            var height = height || 200;
            FB.api(
                "/me/picture?width=" + width + "&height=" + height,
                function (response) {
                    if (response && !response.error) {
                        /* handle the result */
                        if (width == 30) {
                            vm.session.model.currentUser.userNavPhoto = response.data.url;
                        } else {
                            vm.session.model.currentUser.userPhoto = response.data.url;
                        }
                    }
                }
            );
        };

        function getUserNavPhoto() {
            getProfilePhoto(30, 30);
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

        return {
            statusChangeCallback: statusChangeCallback,
            getUserInfo: getUserInfo,
            logout: logout,
            login: login,
            chromeLogin: chromeLogin,
            getProfilePhoto: getProfilePhoto,
            getUserNavPhoto: getUserNavPhoto
        }
    }
})();

