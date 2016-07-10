(function () {
    'use strict';

    angular
        .module('brochure')
        .service('DataService', DataService);

    DataService.$inject = ['$http', 'ENV'];
    function DataService ($http, ENV) {
        var baseUrl = ENV.apiEndpoint + '/api/v1/';

        var getCourtsUrl = baseUrl + "courts/traffic";
        var loginUrl = baseUrl + "authentication/login";
        var logoutUrl = baseUrl + "authentication/logout";
        var signupUrl = baseUrl + 'signup';
        var userUrl = baseUrl + 'user';
        var referralSourceUrl = baseUrl + 'referrals/sources';
        var authorizePaymentUrl = baseUrl + 'cases/{caseId}/payment';
        var confirmCaseUrl = baseUrl + 'cases/{caseId}';

        var login = function(username, password) {
            var url = loginUrl +
                "?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password);
            return $http.post(url);
        };

        var logout = function() {

        };

        var signup = function(newUser, metaData) {
            var headers = {
                'Content-Type': "application/json"
            };
            var data = {
                user : newUser,
                roleType: 'DEFENDANT',
                userReferralSourceTypeId: metaData.sourceTypeId,
                referralCode: metaData.referralCode,
                referralSourceData : metaData.referralSourceData
            };

            return $http.post(signupUrl, data, { headers: headers });
        };

        var getUser = function() {
            return $http.get(userUrl);
        };

        var getReferralSources = function() {
            var getReferralSourcesUrl =  referralSourceUrl;
            return $http.get(getReferralSourcesUrl);
        };

        var getCourts = function (searchQuery) {
            var url = getCourtsUrl + "/" + searchQuery;
            console.log(url);
            return $http.get(url);
        };

        var sendExitFeedback = function (body) {
            var url = "https://api.sendgrid.com/api/mail.send.json";
            var headers = {
                "Authorization": "Bearer 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"
            };

            var email = {
                "personalizations": [
                    {
                        "to": [
                            {
                                "email": "team@offtherecord.com"
                            }
                        ],
                        "subject": "Ticket review requested"
                    }
                ],
                "from": {
                    "email": "website@offtherecord.com"
                },
                "content": [
                    {
                        "type": "text",
                        "value": body
                    }
                ]
            };

            $http.post(url, email, { headers: headers });
        };

        var authorizeCasePayment = function(caseId, dataObj) {
            var url = authorizePaymentUrl.replace('{caseId}', caseId);
            return $http.post(url, dataObj, {withCredentials: true});
        };

        var confirmCase = function(caseId) {
            var url = confirmCaseUrl.replace('{caseId}', caseId);

            return $http.post(url, {withCredentials: true});
        };

        return {
            login: login,
            logout: logout,
            signup: signup,
            getUser: getUser,
            getReferralSources: getReferralSources,
            getCourts: getCourts,
            sendExitFeedback: sendExitFeedback,
            authorizeCasePayment: authorizeCasePayment,
            confirmCase: confirmCase
        }
    }
})();
