(function () {
    'use strict';

    angular.module('brochure', [
        'ui.router',
        'ui.bootstrap',
        'ngRetina',
        'ngCookies'
    ])
    .run(branchInit)
    .config(config);


    config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];
    function config($stateProvider, $urlRouterProvider, $httpProvider) {

        $stateProvider
            .state('default-template', {
                //url: '/webapp/',
                abstract: true,
                views: {
                    // the main template will be placed here (relatively named)
                    '@': {
                        templateUrl: 'app/common/views/default-template.html',
                        controller: 'DefaultTemplateCtrl as vm'
                    },
                    'main-header@default-template': {
                        templateUrl: 'app/common/views/main-header.partial.html'
                    },
                    'main-footer@default-template': {
                        templateUrl: 'app/common/views/footer.partial.html'
                    }
                }
            })
            .state('default-template.home', {
                url: '/',
                views: {
                    '': {
                        templateUrl: 'app/pages/home/home.html',
                        controller: 'HomeCtrl as vm'
                    }
                }
            })
            .state('default-template.state-info', {
                url: '/state/:stateCode',
                views: {
                    '': {
                        templateUrl: 'app/pages/state-info/state-info.html',
                        controller: 'StateInfoCtrl as vm'
                    }
                }
            });

        $urlRouterProvider.otherwise('/');

        $httpProvider.defaults.withCredentials = true;
    }

    // Initialize branch.io and add smart banner
    branchInit.$inject = ['$cookies'];
    function branchInit($cookies) {

        var branchData = null;

        (function(b,r,a,n,c,h,_,s,d,k) {
            if (!b[n]||!b[n]._q) {
                for(;s<_.length;)c(h,_[s++]);d=r.createElement(a);d.async=1;d.src="https://cdn.branch.io/branch-v2.0.0.min.js";k=r.getElementsByTagName(a)[0];k.parentNode.insertBefore(d,k);b[n]=h
            }
        })(window,document,"script","branch",function(b,r){b[r]=function(){b._q.push([r,arguments])}},{_q:[],_v:1},"addListener applyCode banner closeBanner creditHistory credits data deepview deepviewCta first getCode init link logout redeem referrals removeListener sendSMS setIdentity track validateCode".split(" "), 0);

        branch.init('key_live_oik1hC6SvaFGaQl6L4f5chghyqkDbk9G', function(err, data) {
            branchData = data;
            console.log('branch.init error: ', err);
            console.log('branch.init data: ', data);

            // Write Branch data to cookie
            $cookies.putObject('branch-link', JSON.stringify(branchData));

        });

        branch.banner({
                icon: 'https://s3.amazonaws.com/otr-assets/img/favicon/favicon.ico',
                title: 'Off the Record - Fight your traffic ticket',
                description: 'The smart, easy way to fight your traffic ticket',
                openAppButtonText: 'Open',              // Text to show on button if the user has the app installed
                downloadAppButtonText: 'Download',      // Text to show on button if the user does not have the app installed
                sendLinkText: 'Send Link',              // Text to show on desktop button to allow users to text themselves the app
                phonePreviewText: '(999) 999-9999',      // The default phone placeholder is a US format number, localize the placeholder number with a custom placeholder with this option
                showiOS: true,                          // Should the banner be shown on iOS devices?
                showAndroid: false,                      // Should the banner be shown on Android devices?
                showDesktop: false,                      // Should the banner be shown on desktop devices?
                iframe: true,                           // Show banner in an iframe, recomended to isolate Branch banner CSS
                disableHide: false,                     // Should the user have the ability to hide the banner? (show's X on left side)
                forgetHide: true,                          // Should we show the banner after the user closes it? Can be set to true, or an integer to show again after X days
                position: 'top',                        // Sets the position of the banner, options are: 'top' or 'bottom', and the default is 'top'
                mobileSticky: false,                    // Determines whether the mobile banner will be set `position: fixed;` (sticky) or `position: absolute;`, defaults to false *this property only applies when the banner position is 'top'
                desktopSticky: true,                    // Determines whether the desktop banner will be set `position: fixed;` (sticky) or `position: absolute;`, defaults to true *this property only applies when the banner position is 'top'
                make_new_link: false,                   // Should the banner create a new link, even if a link already exists?
                rating: 5,                              // Number of stars (should be your store rating)
                reviewCount: 10,                        // Number of reviews that generate the rating (should be your store reviews)
                theme: 'light'                         // Uses Branch's predetermined color scheme for the banner { 'light' || 'dark' }, default: 'light'
            },
            {
                tags: ['some-random-tag', 'other-random-tag'],
                campaign: 'Marketing Website',
                stage: 'Home Page',
                feature: 'smart_banner',
                data: {
                    '$deeplink_path': 'content/page/12354',
                    deeplink: 'data',
                    username: 'Alex'
                }
            });
    }


})();

