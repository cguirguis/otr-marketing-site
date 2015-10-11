(function () {
    'use strict';

    angular
        .module('brochure')
        .constant('ENV', {

            //'name': 'LOCAL',
            //'apiEndpoint': 'http://localhost:8080'

            //'name': 'DEVO',
            //'apiEndpoint': 'https://otr-backend-service-us-devo.offtherecord.com'

            'name': 'PROD',
            'apiEndpoint': 'https://otr-backend-service-us-prod.offtherecord.com'

        });

})();