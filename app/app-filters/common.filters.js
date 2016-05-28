(function () {
    'use strict';

    angular
        .module('brochure')

        .filter('intToCurrency', function($filter) {
            return function(input) {

                if (isInt(input)) {

                    var isNegative = false;
                    if (input < 0) {
                        isNegative = true;
                        input = input * -1;
                    }

                    var cents = input % 100,
                        dollars = (input - cents) / 100;

                    if (isNegative) {
                        dollars = dollars * -1;
                    }

                    return $filter('currency')(dollars + '.' + cents);
                } else {
                    return input;
                }
            }
        })

        .filter('centsToDollars', function($filter) {
            return function(input) {

                if (isInt(input)) {

                    var isNegative = false;
                    if (input < 0) {
                        isNegative = true;
                        input = input * -1;
                    }

                    var cents = input % 100,
                        dollars = (input - cents) / 100;

                    if (isNegative) {
                        dollars = dollars * -1;
                    }

                    return (dollars + '.' + cents);
                } else {
                    return input;
                }
            }
        })

        .filter('currencyToInt', function($filter) {
            return function(input) {
                if (input) {
                    return input * 100;
                }
            }
        })

        .filter('encodeUri', [
            '$window',
            function ($window) {
                return $window.encodeURIComponent;
            }
        ])

        .filter('replace', [function () {
            function isString(input) {
                return typeof input === 'string' || input instanceof String;
            }

            return function(input, searchValue, newValue) {
                console.log('input: ', input, ', searchValue: ', searchValue, ', newValue: ', newValue);
                if (!isString(input) || !isString(searchValue) || !isString(newValue))
                    return input;

                return input.split(searchValue).join(newValue);
            };
        }])

        .filter('friendlyEnum', function(EnumsModel) {
            return function(input) {
                if (input) {
                    console.log("friendlyEnum filter");
                    var friendlyString = EnumsModel.getFriendlyName(input);
                    return friendlyString || 'N/A';
                }
            }
        })

        .filter('yesNo', function() {
            return function(input) {
                if (input === true) {
                    return 'Yes';
                } else if (input === false) {
                    return 'No';
                } else {
                    return ' - ';
                }
            }
        })

        .filter('booleanToString', function() {
            return function(input, trueString, falseString, placeholder) {
                if (input === true) {
                    return trueString;
                } else if (input === false) {
                    return falseString;
                } else {
                    return placeholder;
                }
            }
        })

        .filter('capitalizeFirst', function() {
            return function(input) {
                if (input != null) {
                    input = input.toLowerCase();
                    return input.substring(0,1).toUpperCase()+input.substring(1);
                }
            }
        })

        .filter('capitalize', function() {
            return function(input, all) {
                return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
            }
        });

    function isInt(value) {
        if (isNaN(value)) {
            return false;
        }
        var x = parseFloat(value);
        return (x | 0) === x;
    }

})();