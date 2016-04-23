(function () {
    'use strict';

    angular.module('brochure', [
        'ui.router',
        'ui.bootstrap',
        'ngRetina',
        'ngCookies'
    ])
    .run(init)
    .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider', '$provide', '$locationProvider'];
    function config($stateProvider, $urlRouterProvider, $httpProvider, $provide, $locationProvider) {

        // enable html5Mode for pushstate ('#'-less URLs)
        $locationProvider.html5Mode(true).hashPrefix('!');
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('default-template', {
                abstract: true,
                views: {
                    // the main template will be placed here (relatively named)
                    '@': {
                        templateUrl: 'app/common/views/default-template.html',
                        controller: 'DefaultTemplateCtrl as vm'
                    },
                    'main-header@default-template': {
                        templateUrl: 'app/common/views/main-header.partial.html',
                        controller: 'DefaultTemplateCtrl as vm'
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
            .state('default-template.help', {
                abstract: true,
                url: '/help',
                views: {
                    '': {
                        templateUrl: 'app/pages/help/help-template.html',
                        controller: 'HelpCtrl as vm'
                    }
                }
            })
            .state('default-template.help.faq', {
                url: '/faq',
                templateUrl: 'app/pages/help/faq.html',
                controller: 'HelpCtrl as vm'
            })
            .state('default-template.help.contact-us', {
                url: '/contact-us',
                templateUrl: 'app/pages/help/contact-us.html',
                controller: 'HelpCtrl as vm'
            })
            .state('default-template.help.about-us', {
                url: '/about-us',
                templateUrl: 'app/pages/help/about-us.html',
                controller: 'HelpCtrl as vm'
            })
            .state('default-template.state-info', {
                abstract: true,
                url: '/:stateCode-:stateName',
                views: {
                    '': {
                        templateUrl: 'app/pages/state-info/state-info.html',
                        controller: 'StateInfoCtrl as vm'
                    }
                }
            })
            .state('default-template.state-info.overview', {
                url: '/traffic-tickets',
                templateUrl: function ($stateParams) {
                    var stateCode = $stateParams.stateCode;
                    var supportedStates = ["CA", "NY", "OR", "WA"];
                    if (!supportedStates.includes(stateCode)) {
                        return 'app/pages/state-info/state/default.html';
                    }
                    return 'app/pages/state-info/state/' + $stateParams.stateCode + '.html';
                },
                controller: 'StateInfoCtrl as vm'
            })
            .state('default-template.state-info.fight', {
                url: '/why-fight-your-traffic-ticket',
                templateUrl: 'app/pages/state-info/fight-ticket.html',
                controller: 'StateInfoCtrl as vm'
            });

        $httpProvider.defaults.withCredentials = true;

        $provide.decorator('$uiViewScroll', function ($delegate) {
            return function (uiViewElement) {
                //var top = uiViewElement[0].getBoundingClientRect().top;
                window.scrollTo(0, (top - 30));
                // Or some other custom behaviour...
            };
        });
    }

    init.$inject = ['$rootScope', '$location', '$anchorScroll', '$cookies'];
    function init($rootScope, $location, $anchorScroll, $cookies) {

        // Initialize branch.io and add smart banner
        branchInit($cookies);

        // Scroll to proper location when URL has location hash
        $rootScope.$on('$routeChangeSuccess', function() {
            $anchorScroll.yOffset = 70;
            if ($location.hash()) {
                $anchorScroll();
            }
        });
    }

    function branchInit($cookies) {

        var cookieExpireDate = new Date();
        var numberOfDaysToAdd = 7;
        cookieExpireDate.setDate(cookieExpireDate.getDate() + numberOfDaysToAdd);

        var cookieDefaults = {
            'domain' : 'offtherecord.com',
            'expires' : cookieExpireDate
        };

        (function(b,r,a,n,c,h,_,s,d,k) {
            if (!b[n]||!b[n]._q) {
                for(;s<_.length;)c(h,_[s++]);d=r.createElement(a);d.async=1;d.src="https://cdn.branch.io/branch-v2.0.0.min.js";k=r.getElementsByTagName(a)[0];k.parentNode.insertBefore(d,k);b[n]=h
            }
        })(window,document,"script","branch",function(b,r){b[r]=function(){b._q.push([r,arguments])}},{_q:[],_v:1},"addListener applyCode banner closeBanner creditHistory credits data deepview deepviewCta first getCode init link logout redeem referrals removeListener sendSMS setIdentity track validateCode".split(" "), 0);

        branch.init('key_live_oik1hC6SvaFGaQl6L4f5chghyqkDbk9G', function(err, data) {
            //console.log('branch.init error: ', err);
            //console.log('branch.init data: ', data);
            //console.log('branch data: ', data.data);
            //console.log('branch data_parsed: ', data.data_parsed);
            //console.log('+clicked_branch_link', data.data_parsed['+clicked_branch_link']);

            // Write Branch data to cookie. Only write the cookie if a Branch link was clicked,
            // otherwise previously written cookies will be overwritten next time user visits site.
            if (data.data_parsed['+clicked_branch_link']) {
                $cookies.put('branch-link', JSON.stringify(data.data_parsed), cookieDefaults);
            }


        });

        branch.banner({
                icon: 'https://s3.amazonaws.com/otr-assets/img/favicon/favicon.ico',
                title: 'Off the Record - Fight your traffic tickets',
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
                forgetHide: 1,                          // Should we show the banner after the user closes it? Can
                // be set to true, or an integer to show again after X days
                position: 'top',                        // Sets the position of the banner, options are: 'top' or 'bottom', and the default is 'top'
                mobileSticky: true,                    // Determines whether the mobile banner will be set `position: fixed;` (sticky) or `position: absolute;`, defaults to false *this property only applies when the banner position is 'top'
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

        branch.addListener('willShowBanner', onShowBranchBanner);
        branch.addListener('willCloseBanner', onCloseBranchBanner);

        function onShowBranchBanner() {
            // Push top navbar down the height of the branch banner
            $(".navbar.navbar-fixed-top").css("top", "76px");
        }

        function onCloseBranchBanner() {
            // Reset navbar's top property to 0
            $(".navbar.navbar-fixed-top").css("top", "0");
        }
    }

})();

