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
        .run(initData)
        .run(init)
        .run(loadEvents)
        .config(config);


    config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider', '$provide', '$locationProvider', 'ngMetaProvider'];
    function config($stateProvider, $urlRouterProvider, $httpProvider, $provide, $locationProvider, ngMetaProvider) {

        // enable html5Mode for pushstate ('#'-less URLs)
        $locationProvider.html5Mode(true).hashPrefix('!');

        $urlRouterProvider.when('/about.html', '/help/about-us');
        $urlRouterProvider.when('/privacy.html', '/help/privacy-policy');
        $urlRouterProvider.when('/refund.html', '/help/refund-policy');
        $urlRouterProvider.when('/terms.html', '/help/terms-and-conditions');
        $urlRouterProvider.otherwise('/');

        // bla bla bla

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
            .state('default-template.help.privacy', {
                url: '/privacy-policy',
                templateUrl: 'app/pages/help/privacy.html',
                meta: {
                    title : 'Privacy Policy',
                    description : 'Read about how we use and protect your data.'
                }
            })
            .state('default-template.help.refund-policy', {
                url: '/refund-policy',
                templateUrl: 'app/pages/help/refunds.html',
                meta: {
                    title : 'Our Money Back Guarantee',
                    description : 'Learn why fighting your ticket with Off The Record is not only smart, but' +
                    ' absolutely risk-free.'
                }
            })
            .state('default-template.help.terms', {
                url: '/terms-and-conditions',
                templateUrl: 'app/pages/help/terms.html',
                meta: {
                    title : 'Terms and Conditions',
                    description : 'Read our general terms and conditions.'
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

                        var selectedState = _.find($rootScope.statesList, function(o) {
                            return o.abbreviation == $stateParams.stateCode;
                        });

                        ngMeta.setTitle(selectedState.name + ' Traffic Tickets & Violations');
                        ngMeta.setTag('description', 'Learn how to fight or pay your ' + selectedState.name + ' traffic ticket, ' +
                            'prevent insurance increase, hire a lawyer in ' + selectedState.name + ' and keep your driving record clean.');
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

                        var selectedState = _.find($rootScope.statesList, function(o) {
                            return o.abbreviation == $stateParams.stateCode;
                        });

                        ngMeta.setTitle('Fight Your ' + selectedState.name + ' Traffic Ticket');
                        ngMeta.setTag('description', 'Learn why you should fight your ' + selectedState.name
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

                        var selectedState = _.find($rootScope.statesList, function(o) {
                            return o.abbreviation == $stateParams.stateCode;
                        });

                        ngMeta.setTitle(selectedState.name + ' Traffic Courts');
                        ngMeta.setTag('description', selectedState.name + ' traffic courts. Fight or pay your traffic ticket. '
                            + 'Court contact information and list of services.');
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
            .state('default-template.ticket-review', {
                url: '/free-ticket-review',
                templateUrl: 'app/pages/ticket-review/ticket-review.html',
                controller: 'DefaultTemplateCtrl as vm',
                meta: {
                    title : 'Free Ticket Review',
                    description : "Not sure if you want to fight your ticket? Request a free review to go over your" +
                    " options and find out whether your ticket is worth fighting."
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
        $rootScope.branchData = {
            isBranchLink : false
        };
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
                    isBranchLink : data.data_parsed['+clicked_branch_link'],
                    channel : data.data_parsed['~channel'],
                    campaign : data.data_parsed['~campaign'],
                    feature : data.data_parsed['~feature'],
                    stage : data.data_parsed['~stage'],
                    tags : data.data_parsed['~tags']
                };

                console.log('finished writing branch data to rootscope');
            }

            console.log('branch init complete');
            $rootScope.branchInitComplete = true;
            $rootScope.$broadcast('BranchInitComplete');
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
                tags: ($rootScope.branchData.tags) ? $rootScope.branchData.tags + ',smart_banner' : tags,
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

    initData.$inject = ['$rootScope'];
    function initData($rootScope) {

        $rootScope.defaultStateValues = {
            backgroundImgUrl : 'assets/img/states/default.jpg',
            baseFee : 250,
            successRate : 95,
            avgFine : 180
        };

        $rootScope.statesList = [
            {
                "name": "Alabama",
                "abbreviation": "AL"
            },
            {
                "name": "Alaska",
                "abbreviation": "AK"
            },
            {
                "name": "Arizona",
                "abbreviation": "AZ"
            },
            {
                "name": "Arkansas",
                "abbreviation": "AR"
            },
            {
                "name": "California",
                "abbreviation": "CA",
                backgroundImgUrl : 'assets/img/states/CA.jpg',
                baseFee : 300,
                successRate : 93,
                avgFine : 207
            },
            {
                "name": "Colorado",
                "abbreviation": "CO"
            },
            {
                "name": "Connecticut",
                "abbreviation": "CT"
            },
            {
                "name": "Delaware",
                "abbreviation": "DE"
            },
            {
                "name": "Florida",
                "abbreviation": "FL"
            },
            {
                "name": "Georgia",
                "abbreviation": "GA"
            },
            {
                "name": "Hawaii",
                "abbreviation": "HI"
            },
            {
                "name": "Idaho",
                "abbreviation": "ID"
            },
            {
                "name": "Illinois",
                "abbreviation": "IL"
            },
            {
                "name": "Indiana",
                "abbreviation": "IN"
            },
            {
                "name": "Iowa",
                "abbreviation": "IA"
            },
            {
                "name": "Kansas",
                "abbreviation": "KS"
            },
            {
                "name": "Kentucky",
                "abbreviation": "KY"
            },
            {
                "name": "Louisiana",
                "abbreviation": "LA"
            },
            {
                "name": "Maine",
                "abbreviation": "ME"
            },
            {
                "name": "Maryland",
                "abbreviation": "MD"
            },
            {
                "name": "Massachusetts",
                "abbreviation": "MA"
            },
            {
                "name": "Michigan",
                "abbreviation": "MI"
            },
            {
                "name": "Minnesota",
                "abbreviation": "MN"
            },
            {
                "name": "Mississippi",
                "abbreviation": "MS"
            },
            {
                "name": "Missouri",
                "abbreviation": "MO"
            },
            {
                "name": "Montana",
                "abbreviation": "MT"
            },
            {
                "name": "Nebraska",
                "abbreviation": "NE"
            },
            {
                "name": "Nevada",
                "abbreviation": "NV"
            },
            {
                "name": "New Hampshire",
                "abbreviation": "NH"
            },
            {
                "name": "New Jersey",
                "abbreviation": "NJ"
            },
            {
                "name": "New Mexico",
                "abbreviation": "NM"
            },
            {
                "name": "New York",
                "abbreviation": "NY",
                backgroundImgUrl : 'assets/img/states/NY.jpg',
                baseFee : 200,
                successRate : 95,
                avgFine : 180
            },
            {
                "name": "North Carolina",
                "abbreviation": "NC"
            },
            {
                "name": "North Dakota",
                "abbreviation": "ND"
            },
            {
                "name": "Ohio",
                "abbreviation": "OH"
            },
            {
                "name": "Oklahoma",
                "abbreviation": "OK",
                backgroundImgUrl : 'assets/img/states/OK.jpg',
                baseFee : 200,
                successRate : 96,
                avgFine : 180
            },
            {
                "name": "Oregon",
                "abbreviation": "OR",
                backgroundImgUrl : 'assets/img/states/OR.jpg',
                baseFee : 350,
                successRate : 88,
                avgFine : 270
            },
            {
                "name": "Pennsylvania",
                "abbreviation": "PA"
            },
            {
                "name": "Rhode Island",
                "abbreviation": "RI"
            },
            {
                "name": "South Carolina",
                "abbreviation": "SC"
            },
            {
                "name": "South Dakota",
                "abbreviation": "SD"
            },
            {
                "name": "Tennessee",
                "abbreviation": "TN"
            },
            {
                "name": "Texas",
                "abbreviation": "TX",
                backgroundImgUrl : 'assets/img/states/TX.jpg',
                baseFee : 200,
                successRate : 97,
                avgFine : 107
            },
            {
                "name": "Utah",
                "abbreviation": "UT"
            },
            {
                "name": "Vermont",
                "abbreviation": "VT"
            },
            {
                "name": "Virginia",
                "abbreviation": "VA"
            },
            {
                "name": "Washington",
                "abbreviation": "WA",
                backgroundImgUrl : 'assets/img/states/WA.jpg',
                baseFee : 200,
                successRate : 97,
                avgFine : 180
            },
            {
                "name": "West Virginia",
                "abbreviation": "WV"
            },
            {
                "name": "Wisconsin",
                "abbreviation": "WI"
            },
            {
                "name": "Wyoming",
                "abbreviation": "WY"
            }
        ];

    }

})();

