(function () {
    'use strict';

    angular.module('brochure', [
        'ui.router',
        'ui.bootstrap',
        'ngRetina',
        'ngCookies',
        'ngMeta',
        'otrBackendService'
    ])
        .run(init)
        .run(loadEvents)
        .config(config);


    config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider', '$provide', '$locationProvider', 'ngMetaProvider'];
    function config($stateProvider, $urlRouterProvider, $httpProvider, $provide, $locationProvider, ngMetaProvider) {

        // enable html5Mode for pushstate ('#'-less URLs)
        $locationProvider.html5Mode(true).hashPrefix('!');
        $urlRouterProvider.otherwise('/');

        //Add a suffix to all page titles
        ngMetaProvider.useTitleSuffix(true);
        ngMetaProvider.setDefaultTitle('OffTheRecord.com - The smart way to fight your traffic tickets');
        ngMetaProvider.setDefaultTitleSuffix(' | OffTheRecord.com');

        //Set defaults for arbitrary tags
        ngMetaProvider.setDefaultTag('author', 'Off the Record, Inc.');
        ngMetaProvider.setDefaultTag('description',
                "Fight your traffic ticket with OffTheRecord.com to get it fully dismissed. " +
                "We have a 97% success rate and offer a full refund if we don't win. " +
                "Your ticket will be matched to the local lawyer with the highest chance of success.");

        ngMetaProvider.setDefaultTag('keywords',
            'traffic ticket lawyer, traffic ticket attorney, speeding ticket lawyer, ' +
            'fight traffic ticket, fight speeding ticket, contest ticket, ' +
            'traffic ticket, traffic lawyer, traffic attorney, speeding ticket');

        function getNameFromStateParam(param) {
            return param.replace("-", " ").replace(/\w\S*/g, function(txt){
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

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
                },
                meta: {
                    // Uses default title
                    'description': 'The smart way to fight your speeding or traffic ticket. We win or it\'s free. ' +
                                   '97% success rate. We match your citation to the lawyer with the highest chance of success.'
                }
            })
            .state('default-template.howitworks', {
                url: '/how-it-works',
                views: {
                    '': {
                        templateUrl: 'app/pages/how-it-works/how-it-works.html'
                        //controller: 'HowItWorksCtrl as vm'
                    }
                },
                meta: {
                    title : 'How to Fight Your Traffic Ticket',
                    description : 'Learn how to fight your traffic ticket with off the record ' +
                    'and why fighting your ticket with our service is better than hiring a lawyer yourself.'
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
                controller: 'HelpCtrl as vm',
                meta: {
                    title : 'Frequently Asked Questions',
                    description : 'OffTheRecord.com is a service that makes it easy to fight any traffic ticket through a lawyer. ' +
                                  'Here are some frequently asked questions about the service.'
                }
            })
            .state('default-template.help.contact-us', {
                url: '/contact-us',
                templateUrl: 'app/pages/help/contact-us.html',
                controller: 'HelpCtrl as vm',
                meta: {
                    title : 'Contact Us',
                    description : 'Contact us if you have questions about your speeding or traffic ticket and how to fight them.'
                }
            })
            .state('default-template.help.about-us', {
                url: '/about-us',
                templateUrl: 'app/pages/help/about-us.html',
                controller: 'HelpCtrl as vm',
                meta: {
                    title : 'About Us',
                    description : 'Learn why Off the Record is the smart way to contest any traffic ticket, and read our story.'
                }
            })
            .state('default-template.state-info', {
                abstract: true,
                url: '/{stateCode:[a-zA-Z]{2}}-{stateName}',
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
                        return 'app/pages/state-info/state/default/overview.html';
                    }
                    return 'app/pages/state-info/state/' + stateCode + '/overview.html';
                },
                controller: 'StateInfoCtrl as vm',
                resolve: {
                    data: ['$rootScope', '$stateParams', 'ngMeta', function($rootScope, $stateParams, ngMeta) {
                        var stateName = getNameFromStateParam($stateParams.stateName);
                        ngMeta.setTitle(stateName + ' Traffic Tickets & Violations');
                        ngMeta.setTag('description', 'Learn how to fight or pay your ' + $stateParams.stateCode + ' traffic ticket, ' +
                            'prevent insurance increase, hire a lawyer in ' + stateName + ' and keep' +
                            ' your driving record clean.');
                    }]
                },
                meta: {
                    disableUpdate : true
                }
            })
            .state('default-template.state-info.fight', {
                url: '/why-fight-your-traffic-ticket',
                templateUrl: 'app/pages/state-info/fight-ticket.html',
                controller: 'StateInfoCtrl as vm',
                resolve: {
                    data: ['$rootScope', '$stateParams', 'ngMeta', function($rootScope, $stateParams, ngMeta) {
                        var stateName = getNameFromStateParam($stateParams.stateName);
                        ngMeta.setTitle('Fight Your ' + stateName + ' Traffic Ticket');
                        ngMeta.setTag('description', 'Learn why you should fight your ' + stateName
                            + ' traffic ticket and how Off the Record connects you with the lawyer most likely '
                            + 'to get your ticket dismissed.');
                    }]
                },
                meta: {
                    disableUpdate : true
                }
            })
            .state('default-template.state-info.courts', {
                url: '/courts',
                templateUrl: function($stateParams) {
                    var stateCode = $stateParams.stateCode;
                    var supportedStates = ["CA", "NY", "OR", "WA"];
                    return !supportedStates.includes(stateCode)
                        ? 'app/pages/state-info/state/default/courts.html'
                        : 'app/pages/state-info/state/' + stateCode + '/courts.html';
                },
                controller: 'StateInfoCtrl as vm',
                resolve: {
                    data: ['$rootScope', '$stateParams', 'ngMeta', function($rootScope, $stateParams, ngMeta) {
                        var stateName = getNameFromStateParam($stateParams.stateName);
                        ngMeta.setTitle(stateName + ' Traffic Courts');
                        ngMeta.setTag('description', stateName + ' traffic courts. Fight or pay your traffic ticket. ' +
                            'Court contact information and list of services.');
                    }]
                },
                meta: {
                    disableUpdate : true
                }
            })
            .state('default-template.refer-a-friend', {
                url: '/refer-a-friend/:referralCode',
                templateUrl: 'app/pages/referral/refer-a-friend.html',
                controller: 'ReferralCtrl as vm',
                meta: {
                    title : 'Refer a friend',
                    description : "Share a $20 credit with your friends. You'll earn $20 when they fight their ticket."
                }
            })
            .state('default-template.insurance-impact', {
                url: '/insurance-impact',
                templateUrl: 'app/pages/content/insurance-impact.html',
                meta: {
                    title : 'How Tickets Increase Insurance Rates',
                    description : "Find out why insurance rates go up after you get a ticket, and how much your" +
                    " ticket could end up costing you."
                }
            });

        $httpProvider.defaults.withCredentials = true;

        $provide.decorator('$uiViewScroll', ['$delegate', function ($delegate) {
            return function (uiViewElement) {
                //var top = uiViewElement[0].getBoundingClientRect().top;
                window.scrollTo(0, (top - 30));
                // Or some other custom behaviour...
            };
        }]);
    }

    init.$inject = ['$document', '$rootScope', '$location', '$anchorScroll', '$cookies', 'ngMeta'];
    function init($document, $rootScope, $location, $anchorScroll, $cookies, ngMeta) {

        writeReferrerCookie($document, $cookies);

        // Initialize page title and meta tags
        ngMeta.init();

        // Initialize branch.io and add smart banner
        branchInit($rootScope, $cookies);

        // Scroll to proper location when URL has location hash
        $rootScope.$on('$routeChangeSuccess', function() {
            $anchorScroll.yOffset = 70;
            if ($location.hash()) {
                $anchorScroll();
            }
        });
    }

    function writeReferrerCookie($document, $cookies) {

        var referrer = $document[0].referrer;
        console.log('Referrer is (app.js): ', referrer);

        // don't write (or overwrite) a cookie if there's no referrer value
        if (!referrer || referrer == '') {
            return;
        }

        var cookieExpireDate = new Date();
        var numberOfDaysToAdd = 14;
        cookieExpireDate.setDate(cookieExpireDate.getDate() + numberOfDaysToAdd);

        var cookieDefaults = {
            'domain' : 'offtherecord.com',
            'expires' : cookieExpireDate
        };

        $cookies.put('otr-referrer', JSON.stringify(referrer), cookieDefaults);
    }

    function branchInit($rootScope, $cookies) {

        var cookieExpireDate = new Date();
        var numberOfDaysToAdd = 14;
        cookieExpireDate.setDate(cookieExpireDate.getDate() + numberOfDaysToAdd);

        var cookieDefaults = {
            'domain' : 'offtherecord.com',
            'expires' : cookieExpireDate
        };

        // initialize structure to avoid null checks.
        $rootScope.branchData = {};
        // Set defaults for banner click.
        var channel = 'Website';
        var campaign = '';
        var feature = 'smart_banner';
        var stage = '';
        var tags = ['some-random-tag', 'other-random-tag'];


        (function(b,r,a,n,c,h,_,s,d,k) {
            if (!b[n]||!b[n]._q) {
                for(;s<_.length;)c(h,_[s++]);d=r.createElement(a);d.async=1;d.src="https://cdn.branch.io/branch-v2.0.0.min.js";k=r.getElementsByTagName(a)[0];k.parentNode.insertBefore(d,k);b[n]=h
            }
        })(window,document,"script","branch",function(b,r){b[r]=function(){b._q.push([r,arguments])}},{_q:[],_v:1},"addListener applyCode banner closeBanner creditHistory credits data deepview deepviewCta first getCode init link logout redeem referrals removeListener sendSMS setIdentity track validateCode".split(" "), 0);

        branch.init('key_live_oik1hC6SvaFGaQl6L4f5chghyqkDbk9G', function(err, data) {
            console.log('branch.init data: ', data);

            // Write Branch data to cookie. Only write the cookie if a Branch link was clicked,
            // otherwise previously written cookies will be overwritten next time user visits site.
            if (data.data_parsed['+clicked_branch_link']) {
                $cookies.put('branch-link', JSON.stringify(data.data_parsed), cookieDefaults);

                // If a branch link was clicked and the user then clicks on the Branch banner,
                // we need to pass along the values of the originally clicked Branch link.

                $rootScope.branchData = {
                    channel : data.data_parsed['~channel'],
                    campaign : data.data_parsed['~campaign'],
                    feature : data.data_parsed['~feature'],
                    stage : data.data_parsed['~stage'],
                    tags : data.data_parsed['~tags']
                };

                //channel = data.data_parsed['~channel'];
                //campaign = data.data_parsed['~campaign'];
                //feature = data.data_parsed['~feature'];
                //stage = data.data_parsed['~stage'];
                //tags = data.data_parsed['~tags'];
            }

            $rootScope.branchInitComplete = true;
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
                channel: ($rootScope.branchData.channel) ? $rootScope.branchData.channel : channel,
                campaign: ($rootScope.branchData.campaign) ? $rootScope.branchData.campaign : campaign,
                feature: ($rootScope.branchData.feature) ? $rootScope.branchData.feature : feature,
                stage: ($rootScope.branchData.stage) ? $rootScope.branchData.stage : stage,
                tags: ($rootScope.branchData.tags) ? $rootScope.branchData.tags : tags,
                data: {
                    '$deeplink_path': 'content/page/12354'
                    //deeplink: 'data',
                    //username: 'Alex'
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

    loadEvents.$inject = ['$state', '$rootScope', '$location', '$cookies'];
    function loadEvents($state, $rootScope, $location, $cookies) {

    }

})();

