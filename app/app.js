(function () {
    'use strict';

    angular.module('brochure', [
        'ui.bootstrap',
        'ngRetina',
        'ngRoute'
    ])
    .run(run)
    .config(config);

    config.$inject = ['$routeProvider', '$locationProvider'];
    function config($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'home.html',
                controller: 'BrochureCtrl'
            })
            .when('/state/:stateCode', {
                templateUrl: 'state-info.html',
                controller: 'StateInfoCtrl'
            })/*
            .when('/c', {
                templateUrl: 'content.html',
                controller: 'ContentCtrl'
            })*/;

        $locationProvider.html5Mode({ enabled: false, requireBase: false});
    }

    function run() {
    }
    run.$inject = [];

})();

