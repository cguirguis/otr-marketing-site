(function () {
    'use strict';

    angular
        .module('brochure')
        .factory('AWSService', AWSService);

    AWSService.$inject = ['$http', '$q', 'ENV', 'DataService'];
    function AWSService($http, $q, ENV, DataService) {
        var service = {};
        var sesClient = new AWS.SES({apiVersion: '2010-12-01', region: 'us-west-2'});
        var awsClient = new AWS.S3();

        var URLS = {
            GET_CREDENTIALS: ENV.apiEndpoint + '/api/v1/credentials/aws'
        };
        var bucketRegex = /http.?:\/\/([-\w]+).*.com/;
        var keyRegex    = /s3.amazonaws.com\/(.*)/;
        var credentialsSet = false;

        // INTERFACE

        service.setCredentials = setCredentials;
        service.sendEmail = sendEmail;
        service.getSignedUrl = getSignedUrl;

        return service;

        // PUBLIC FUNCTIONS

        function sendEmail(data) {
            if (!credentialsSet) {
                sesClient = new AWS.SES({
                    apiVersion: '2010-12-01',
                    region: 'us-west-2',
                    accessKeyId: 'AKIAJVORDRKYK5GZ3BMA',
                    secretAccessKey: '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'
                });
                credentialsSet = true;
            }
            var params = {
                Destination: {
                    ToAddresses: [
                        'team@offtherecord.com'
                    ]
                },
                Message: {
                    Subject: {
                        Data: data.subject,
                        Charset: 'ASCII'
                    },
                    Body: {
                        Html: {
                         Data: data.emailHtml,
                         Charset: 'ASCII'
                         },
                        /*Text: {
                            Data: "Name: " + data.name + "\n\Contact: " + data.contact,
                            Charset: 'ASCII'
                        }*/
                    }
                },
                Source: 'team@offtherecord.com'
            };
            sesClient.sendEmail(params, function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);           // successful response
            });
        }

        function setCredentials(callback, params) {
            return getCredentials("S3_CITATION_IMAGES_RO")
                .then(
                    function(response) {
                        var creds = response;
                        var awsCreds = new AWS.Credentials({
                            accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretKey
                        });
                        sesClient.config.credentials = awsCreds;
                        credentialsSet = true;
                        callback(params);
                    }
                );
        }

        function getSignedUrl(options) {
            var imageUrl      = options.imageUrl;

            var bucketMatches = bucketRegex.exec(imageUrl);
            var bucketName    = bucketMatches[1];
            var keyMatches    = keyRegex.exec(imageUrl);
            var keyName       = keyMatches[1];

            var params = {
                Bucket: bucketName,
                Key:    keyName
            };

            awsClient.getSignedUrl('getObject', params, function (err, url) {
                options.success(url);
            });
        }

        // PRIVATE FUNCTIONS

        function getCredentials(key) {
            var requestBody = {
                keyName: key
            };
            return $http.post(URLS.GET_CREDENTIALS, requestBody)
                .then(
                    function(response) {
                        console.log('response is...', response);
                        return response.data;
                    },
                    function(error) {
                        console.log('Error get aws credentials: ', error);
                        return $q.reject(error);
                    }
                );
        }

    }

})();
