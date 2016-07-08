(function () {
    'use strict';

    angular
        .module('brochure')
        .service('FacebookService', FacebookService);

    FacebookService.$inject = ['$q', '$rootScope', 'DataService'];
    function FacebookService ($q, $rootScope, DataService) {

        var statusChangeCallback = function(response, metaData) {
            // This is called with the results from from FB.getLoginStatus().

            // The response object is returned with a status field that lets the
            // app know the current login status of the person.
            // Full docs on the response object can be found in the documentation
            // for FB.getLoginStatus().
            if (response.status === 'connected') {
                // Logged into Facebook and authorized for app
                return getUserInfo()
                    .then(function(userResponse) {
                        //$rootScope.user = userResponse;
                        $rootScope.user = $rootScope.user || {};
                        $rootScope.user.firstname = userResponse.first_name;
                        $rootScope.user.lastname = userResponse.last_name;
                        $rootScope.fbAuth = {
                            "accessToken": response.authResponse.accessToken,
                            "expiresIn" : response.authResponse.expiresIn,
                            "userID": response.authResponse.userID
                        };

                        //console.log("logged into fb: " + JSON.stringify($rootScope.fbAuth));

                        getProfilePhoto();
                        getUserNavPhoto();

                        var branchData = { referralSourceData: $rootScope.branchData };

                        // Authenticate user to our service
                        return DataService.loginWithFacebook($rootScope.fbAuth, branchData)
                            .then(function(response) {
                                // Now get user info
                                DataService.getUser()
                                    .then(function(response) {
                                        $rootScope.user = response.data.user;
                                        //call into Android's native code. TODO: Make a delegate class for this.
                                        if(!(typeof Android === 'undefined')) {
                                            Android.registerDeviceToken(JSON.stringify(response));
                                        }
                                    });
                                $rootScope.$broadcast('user:logged-in');
                                return response;
                            });
                    })
                    .then(
                    function(otrResponse){
                        console.log("\n\nLogged in to OTR via Facebook.");
                        $rootScope.hideLoader();
                        $rootScope.preventLoadingModal = false;
                        return otrResponse;
                    },
                    function(response) {
                        console.log(JSON.stringify(response.data.error.uiErrorMsg));
                        $rootScope.errorMessage = response.data.error.uiErrorMsg;
                        $rootScope.hideLoader();
                        $rootScope.preventLoadingModal = false;
                        return $q.reject(response);
                    });
            }
            else if (response.status === 'not_authorized') {
                // The person is logged into Facebook, but not your app.
                //document.getElementById('status').innerHTML = 'Please log ' + 'into this app.';
                //FB.login()
                console.log("FB AUTH STATUS: not_authorized");
                $rootScope.preventLoadingModal = false;
                return $q.reject("not_authorized");
            }
            else {
                // The person is not logged into Facebook, prompt them to login
                //FB.login();
                console.log("FB AUTH STATUS: not_connected");
                $rootScope.preventLoadingModal = false;
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
                $rootScope.$apply(function() {
                    $rootScope.user = {};
                    $rootScope.user.isFbAuthed = false;
                });
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
                            $rootScope.userNavPhoto = response.data.url;
                        } else {
                            $rootScope.userPhoto = response.data.url;
                        }
                    }
                }
            );
        };

        function getUserNavPhoto() {
            getProfilePhoto(30, 30);
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

