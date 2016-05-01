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

        return {
            getCourts: getCourts
        }
    }
})();
