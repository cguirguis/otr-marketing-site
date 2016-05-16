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

        var login = function(username, password) {
            var url = loginUrl +
                "?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password);
            return $http.post(url);
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

        return {
            login: login,
            getCourts: getCourts,
            sendExitFeedback: sendExitFeedback
        }
    }
})();
