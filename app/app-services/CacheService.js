(function () {
    'use strict';

    angular
        .module('brochure')
        .factory('CacheService', CacheService);

    CacheService.$inject = ['$rootScope'];
    function CacheService($rootScope) {
        var service = {
            model: {
                state: null,
                citation: null,
                case: null,
                refundEligibility: null,
                currentStep: 1,
                email: null,
                currentUser: null
            },
            SaveState: function () {
                sessionStorage.CacheService = angular.toJson(service.model);
            },
            RestoreState: function () {
                service.model = angular.fromJson(sessionStorage.CacheService);
            }
        };

        $rootScope.$on("savestate", service.SaveState);
        $rootScope.$on("restorestate", service.RestoreState);

        return service;
    }

})();