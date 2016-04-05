(function () {
    'use strict';

    angular
        .module('brochure')
        .constant('ENV', {

            //'name': 'LOCAL',
            //'apiEndpoint': 'http://localhost:8080'

            'name': 'DEVO',
            'apiEndpoint': 'https://otr-backend-service-us-devo.offtherecord.com'

            //'name': 'PROD',
            //'apiEndpoint': 'https://otr-backend-service-us-prod.offtherecord.com'

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