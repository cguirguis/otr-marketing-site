(function () {
    'use strict';

    angular
        .module('brochure')
        .constant('ENV', {

            //'name': 'LOCAL',
            //'apiEndpoint': 'http://localhost:8080'

            'name': '@@domain-name',
            'apiEndpoint': '@@endpoint',
            'apiEndpointWithVersion': '@@endpoint/api/v1/',

            //'name': 'DEVO',
            //'apiEndpoint': 'https://otr-backend-service-us-devo.offtherecord.com',
            'stripeClientId': 'ca_6TCbA0GpnmIafv7SC53zClcFYNajc6st',
            'stripePublishableKey': 'pk_test_fHIOKc7Sf7gNjwUIIT3XJfDt',

            //'name': 'PROD',
            //'apiEndpoint': 'https://otr-backend-service-us-prod.offtherecord.com',
            //'apiEndpointWithVersion': '@@endpoint/api/v1/',
            //'stripeClientId': 'ca_6TCbZWE2tFU2EXiOWrkKK3KA5h0NMFIv',
            //'stripePublishableKey': 'pk_live_tfkS6orQi9EW3DePjrkHNLMT',

            })
        .run(run);

    run.$inject = ['$rootScope', 'ENV'];
    function run($rootScope, ENV) {

        $rootScope.trackFBButtonConversion = function(buttonName, buttonValue) {
            console.log('running trackFBButtonConversion()...');
            var fbPixelId = '169269843443494'
            if(ENV.name === 'PROD') {
                var cd = {};
                cd.buttonName = buttonName;
                cd.buttonValue = buttonValue;
                _fbq.push(['track', fbPixelId, cd]);
            }
        };
    }
})();