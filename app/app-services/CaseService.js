(function () {
    'use strict';

    angular
        .module('brochure')
        .service('CaseService', CaseService);

    CaseService.$inject = ['$http', '$q', 'DataService'];
    function CaseService ($http, $q, DataService) {

        var authorizeCasePayment = function(caseId, cardId) {
            var dataObj = {
                cardId : cardId
            };

            return DataService.authorizeCasePayment(caseId, dataObj)
                .then(
                    function(response) { }
                )
                .catch(
                    function(error) {
                        console.log('ERROR: Payment authorization failed: ', error);
                        return $q.reject(error);
                    }
                );
        };

        var confirmCaseAsBooked = function(caseId) {
            return DataService.confirmCase(caseId)
                .then(
                    function(response) { }
                )
                .catch(
                    function(error) {
                        console.log('Error while confirming case: ', error);
                        return $q.reject(error);
                    }
                );
        };

        var rematchCase = function(caseId) {
            return DataService.rematchCase(caseId)
                .then(
                    function(response) {
                        return response.data;
                    },
                    function(error) {
                        console.log('ERROR: Failed to rematch case: ', error);
                        return $q.reject(error);
                    }
                );
        };

        var applyRefCode = function(caseId, refCode) {
            if (caseId == null || caseId == '' || refCode == null || refCode =='') {
                return $q.reject('caseId and refCode are required');
            }

            return DataService.applyRefCode(caseId, refCode)
                .then(
                    function(response) {
                        return response.data;
                    },
                    function(error) {
                        console.log('ERROR: Failed to apply RefCode: ', error);
                        return $q.reject(error);
                    }
                );
        };

        return {
            authorizeCasePayment: authorizeCasePayment,
            confirmCaseAsBooked: confirmCaseAsBooked,
            rematchCase: rematchCase,
            applyRefCode: applyRefCode
        }
    }
})();
