(function () {
    'use strict';

    angular
        .module('brochure')
        .service('CaseService', CaseService);

    CaseService.$inject = ['$http', '$q', 'DataService'];
    function CaseService ($http, $q, DataService) {

        var authorizeCasePayment = function(caseId, cardId) {
            console.log('Authorizing case payment: ', caseId, ', cardId: ', cardId);

            var dataObj = {
                cardId : cardId
            };

            return DataService.authorizeCasePayment(caseId, dataObj)
                .then(
                    function(response) {
                        console.log('Payment authorization successfully');
                    }
                )
                .catch(
                    function(error) {
                        console.log('ERROR: Payment authorization failed: ', error);
                        return $q.reject(error);
                    }
                );
        };

        var confirmCaseAsBooked = function(caseId) {
            console.log('Confirming case as booked: ', caseId);

            DataService.confirmCase(caseId)
                .then(
                    function(response) {
                        console.log('case was successfully confirmed: ', response.data);
                    }
                )
                .catch(
                    function(error) {
                        console.log('Error while confirming case: ', error);
                        return $q.reject(error);
                    }
                );
        };

        return {
            confirmCaseAsBooked: confirmCaseAsBooked
        }
    }
})();
