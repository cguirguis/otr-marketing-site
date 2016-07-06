(function () {
    'use strict';

    angular
        .module('brochure')
        .service('StripeService', StripeService);

    StripeService.$inject = ['ENV', '$http', '$q', '$rootScope', 'stripe'];
    function StripeService(ENV, $http, $q, $rootScope, stripe) {
        var service = {},

            URLS = {
                POST_STRIPE_OAUTH: ENV.apiEndpointWithVersion + 'stripe/connect?code={code}',
                POST_NEW_PAYMENT_METHOD: ENV.apiEndpointWithVersion + 'users/stripe/account/cards',
                GET_CONNECTED_ACCOUNT: ENV.apiEndpointWithVersion + 'lawfirms/{lawfirmId}/stripe',
                GET_PAYMENT_METHODS: ENV.apiEndpointWithVersion + 'users/{userId}/paymentmethods'
            };


        // ----- INTERFACE ------------------------------------------------------------
        service.requestStripeAccessToken = requestStripeAccessToken;
        service.getStripeConnectedAccount = getStripeConnectedAccount;
        service.getPaymentMethodsForUser = getPaymentMethodsForUser;
        service.addNewPaymentMethodForUser = addNewPaymentMethodForUser;

        (function initService() {
            console.log('----- Initializing StripeService -----');

            // Set the Stripe publishable key
            stripe.setPublishableKey(ENV.stripePublishableKey)

            // clear all data when user logs out
            $rootScope.$on('LogoutEvent', function(event, next, current) {

            });

        })();

        return service;

        // ----- PUBLIC METHODS -------------------------------------------------------

        function addNewPaymentMethodForUser(userId, stripeToken) {

            var endpoint = URLS.POST_NEW_PAYMENT_METHOD.replace('{userId}', userId);

            var dataObj = {
                sourceToken : stripeToken,
                makeDefault: true
            };

            return $http.post(endpoint, dataObj, {withCredentials: true})
                .then(
                function(response) {
                    console.log('New payment method persisted: ', response);
                })
                .catch(
                function(error) {
                    console.log('Could not add new payment method: ', error);
                    return $q.reject(error);
                }
            );
        }

        function getPaymentMethodsForUser(userId) {
            console.log("Retrieving payment methods for user: ", userId);

            var endpoint = URLS.GET_PAYMENT_METHODS.replace('{userId}', userId);

            return $http.get(endpoint, {withCredentials: true})
                .then(
                    function(response) {
                        return response.data.paymentMethods;
                    },
                    function(error) {
                        console.log('Error retrieving payment methods: ', error);
                        if (error.data && error.data.error) {
                            return $q.reject(error.data.error.uiErrorMsg);
                        }
                        return $q.reject(error);
                    }
                );
        }

        function getStripeConnectedAccount(lawfirmId) {
            var endpoint = URLS.GET_CONNECTED_ACCOUNT.replace('{lawfirmId}', lawfirmId);

            var promise = $http.get(endpoint, {withCredentials: true})
                .then(
                    function(response) {
                        console.log('Successfully retrieved connected Stripe account: ', response);
                        return response.data;
                    },
                    function(error) {
                        console.log('Error retrieving connected Stripe account: ', error);
                        if (error.data && error.data.error) {
                            return $q.reject(error.data.error.uiErrorMsg);
                        }
                        return $q.reject(error);
                    }
                );
            return promise;
        }

        function requestStripeAccessToken(code) {

            console.log('Attempting to connect with lawfirm Stripe account: ', code);
            var endpoint = URLS.POST_STRIPE_OAUTH.replace('{code}', code);
            console.log('endpoint for stripe token: ', endpoint);

            var promise = $http.post(endpoint, {withCredentials: true})
                .then(
                    function(response) {
                        console.log('Successfully authenticated Stripe account: ', response);
                        return;
                    },
                    function(error) {
                        console.log('error authenticated Stripe account: ', error);
                        if (error.data && error.data.error) {
                            return $q.reject(error.data.error.uiErrorMsg);
                        }
                        return $q.reject(error);
                    }
                );
            return promise;
        }

    }

})();