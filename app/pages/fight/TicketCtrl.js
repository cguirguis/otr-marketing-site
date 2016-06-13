(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('TicketCtrl', TicketCtrl);

    TicketCtrl.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$q', 'ENV'];
    function TicketCtrl($rootScope, $scope, $state, $stateParams, $q, ENV) {
        var vm = this;

        // State details
        vm.selectedState = _.find($rootScope.statesList, function(o) {
            return o.abbreviation == $stateParams.stateCode;
        });

        // Upload Image Step
        vm.isImgFormSubmitted = false;
        vm.isCourtFormSubmitted = false;
        vm.isTicketInfoFormSubmitted = false;
        vm.isPaymentFormSubmitted = false;

        // File upload event handlers
        vm.flowFilesSubmitted = flowFilesSubmitted;
        vm.flowFileSuccess = flowFileSuccess;
        vm.flowFileAdded = flowFileAdded;
        vm.processFile = processFile;

        // Used alongside uploading files
        vm.imgContent = null;

        vm.isCouponApplied = false;
        vm.showCouponInput = false;
        vm.isNoLawfirmAvailable = false;
        vm.newCard = {};

        vm.verifyImageUpload = verifyImageUpload;
        vm.removeTicketPhoto = removeTicketPhoto;
        vm.submitPhotoStep = submitPhotoStep;
        vm.formatMatchingCourtsResponse = formatMatchingCourtsResponse;
        vm.findMatchingCourts = findMatchingCourts;
        vm.isCourtFormInError = isCourtFormInError;
        vm.submitCourtStep = submitCourtStep;

        var otrService = $rootScope.otrService || new OtrService({domain: ENV.apiEndpoint});


        // ----- PUBLIC METHODS -------------------------------------------------------

        (function initController() {
            $scope.$on('$viewContentLoaded', function() {

            });
        })();

        function flowFilesSubmitted(flow) {
            console.log("Event Kicked Off: flow-files-submitted");
            // flow.upload();
        }

        function flowFileSuccess(file, message) {
            console.log("Event Kicked Off: flow-file-success: ", message);
            file.msg = message
        }

        function flowFileAdded(file) {
            console.log("Event Kicked Off: flow-file-added");
            !!{png: 1, gif: 1, jpg: 1, jpeg: 1}[file.getExtension()];
        }

        function processFile(files) {
            var fileReader = new FileReader();

            angular.forEach(files, function (flowFile, i) {
                fileReader.onload = function (event) {
                    var base64result = fileReader.result.split(',')[1];
                    vm.imgContent = {
                        fileName: flowFile.name,
                        fileType: flowFile.file.type,
                        base64Data: base64result
                    };
                    vm.dataLoading = true;
                    createNewCitationWithFile(vm.imgContent.base64Data)
                        .then(
                        function(response) {
                            vm.dataLoading = false;
                        },
                        function(error) {
                            vm.dataLoading = false;
                            console.log('ERROR: ', error);
                            return $q.reject(error);
                        }
                    );
                };

                fileReader.readAsDataURL(flowFile.file);
            });
        }

        function removeTicketPhoto() {
            vm.imgContent = null;
            vm.obj.flow.files = [];
        }

        function verifyImageUpload() {
            if (vm.imgContent == null) {
                return false;
            }
            return true;
        }

        function formatMatchingCourtsResponse(courtsResponse) {

            console.log('formatting response: ', courtsResponse);

            _.forEach(courtsResponse.courts, function(elem, key) {
                elem.customDescription = elem.address.city + ', ' + elem.address.stateCode + ' - ' + elem.county + ' County';
            });

            return courtsResponse;
        }

        function findMatchingCourts(userInputString, timeoutPromise) {
            var params = {
                searchQuery: userInputString
            }

            vm.isCourtSearchLoading = true;

            return otrService.getCourtsByQueryUsingGET(params)
                .then(
                function(response) {
                    vm.isCourtSearchLoading = false;
                    return response;
                },
                function(error) {
                    vm.isCourtSearchLoading = false;
                    return $q.reject(error);
                }
            );
        }

        function isCourtFormInError() {

            if (vm.isCourtFormSubmitted == false) {
                return false;
            }

            if (vm.selectedCourt && vm.selectedCourt.originalObject) {
                if (vm.selectedCourt.originalObject.courtId != null) {
                    return false;
                }
            }

            return true;
        }

        function submitCourtStep() {
            vm.isCourtFormSubmitted = true;

            if (vm.selectedCourt == null || vm.selectedCourt.originalObject == null || vm.selectedCourt.originalObject.courtId == null) {
                return false;
            }

            var court = vm.selectedCourt.originalObject;
            // Set the selected court in the citation
            vm.newCitation.court = {
                courtId : court.courtId,
                location: court.address.city + ", " + court.address.stateCode
            };

            console.log("court: ", vm.selectedCourt.originalObject);
            console.log("citation with court: ", vm.newCitation);
        }


        // ----- PRIVATE METHODS -------------------------------------------------------

        function createNewCitationWithFile(imgData) {
            var dataObj = {
                request: {
                    rawImageData: imgData,
                    clientType: "DESKTOP_WEBAPP"
                }
            };

            return otrService.createNewCitationUsingPOST(dataObj)
                .then(
                    function (response) {
                        /*AWSS3Service.getSignedUrl(
                             {
                             imageUrl: citation.ticketImageUrl,
                             success: function(signedUrl) {
                                 vm.signedImageUrl = signedUrl;
                                 console.log("signed image url: ", vm.signedImageUrl);
                                 }
                             }
                         );*/

                        vm.newCitation = response.citation;

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

        function submitPhotoStep() {
            vm.isImgFormSubmitted = true;

            if (vm.imgContent != null) {
                $state.go('default-template.fight.court', {});
            }
        }
    }
})();