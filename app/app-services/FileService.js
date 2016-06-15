(function () {
    'use strict';

    angular
        .module('brochure')
        .factory('FileService', FileService);

    FileService.$inject = ['$rootScope', '$q', 'ENV', 'OtrService'];
    function FileService($rootScope, $q, ENV, OtrService) {
        var service = {};
        var otrService = $rootScope.otrService || new OtrService({domain: ENV.apiEndpoint});

        // INTERFACE

        service.initializeFileReaderHandler = initializeFileReaderHandler;
        service.readFile = readFile;
        service.createNewCitationWithFile = createNewCitationWithFile;

        return service;

        // PUBLIC FUNCTIONS

        function initializeFileReaderHandler() {
            // Attach file reader event handler
            if (window.File && window.FileReader && window.FormData) {
                var $inputField = $('#file');

                $inputField.on('change', function (e) {
                    var file = e.target.files[0];

                    if (file) {
                        if (/^image\//i.test(file.type)) {
                            readFile(file);
                        } else {
                            console.error('Not a valid image!');
                        }
                    }
                });
            } else {
                console.error("File upload is not supported!");
            }
        }

        function readFile(file) {
            var reader = new FileReader();

            reader.onloadend = function (e) {
                $rootScope.citation = {};
                processFile(reader.result, file.type);

                // Show image preview
                document.getElementById("citation-image").src = e.target.result;
            };

            reader.onerror = function () {
                console.error('There was an error reading the file!');
            };

            reader.readAsDataURL(file);
        }

        function createNewCitationWithFile(imgData) {
            var dataObj = {
                request: {
                    rawImageData: imgData
                }
            };

            return otrService.createNewCitationUsingPOST(dataObj)
                .then(
                function (response) {
                    var citation = response.citation;
                    console.log("unsigned url: ", citation.ticketImageUrl);

                    // set some defaults
                    citation.citationIssueDateUTC = new Date();
                    citation.violationCount = 1;
                    citation.involvesAccident = false;
                    citation.isPastDue = false;
                    $rootScope.citation = citation;

                    return citation;
                },
                function (error) {
                    console.error('ERROR creating citation from image: ', error);
                    return $q.reject(error);
                }
            );
        }


        // PRIVATE FUNCTIONS

        function processFile(dataURL, fileType) {
            var maxWidth = 1000;
            var maxHeight = 1000;

            var image = new Image();
            image.src = dataURL;
            var base64result = dataURL.split(',')[1];

            image.onload = function () {
                var width = image.width;
                var height = image.height;
                var shouldResize = (width > maxWidth) || (height > maxHeight);

                if (shouldResize) {
                    createNewCitationWithFile(base64result);
                    return;
                }

                var newWidth;
                var newHeight;

                if (width > height) {
                    newHeight = height * (maxWidth / width);
                    newWidth = maxWidth;
                } else {
                    newWidth = width * (maxHeight / height);
                    newHeight = maxHeight;
                }

                var canvas = document.createElement('canvas');

                canvas.width = newWidth;
                canvas.height = newHeight;

                var context = canvas.getContext('2d');

                context.drawImage(this, 0, 0, newWidth, newHeight);

                dataURL = canvas.toDataURL(fileType);

                createNewCitationWithFile(base64result);
            };

            image.onerror = function () {
                console.error('There was an error processing your file!');
            };
        }
    }

})();

