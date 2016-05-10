(function () {
    'use strict';

    angular
        .module('brochure')
        .service('DataService', DataService);

    DataService.$inject = ['$http', 'ENV'];
    function DataService ($http, ENV) {
        var baseUrl = ENV.apiEndpoint + '/api/v1/';

        var getCourtsUrl = baseUrl + "courts/traffic";

        var getCourts = function (searchQuery) {
            var url = getCourtsUrl + "/" + searchQuery;
            console.log(url);
            return $http.get(url);
        };

        var sendExitFeedback = function (body) {
            var url = "https://api:key-5fcf54949d6c85971b6d45e8c0bd6816@api.mailgun.net/v3/sandbox5b04cf85e6284172b1834e06d4d946d7.mailgun.org/messages";
            var headers = {
                //"Access-Control-Allow-Headers": "Content-Type, x-requested-with, Authorization",
                //"Authorization": "Basic YXBpOmtleS01ZmNmNTQ5NDlkNmM4NTk3MWI2ZDQ1ZThjMGJkNjgxNg==",
                "Access-Control-Allow-Origin": "http://localhost:8888",
                "Content-Type" : "application/x-www-form-urlencoded"
            };

            var email = {
                "from": "Mailgun Sandbox <postmaster@sandbox5b04cf85e6284172b1834e06d4d946d7.mailgun.org>",
                "to": "Off the Record <team@offtherecord.com>",
                "subject": "Exit popup feedback",
                "text": body
            };
            $http.post(url, email, { headers: headers });
        };

        return {
            getCourts: getCourts,
            sendExitFeedback: sendExitFeedback
        }
    }
})();
