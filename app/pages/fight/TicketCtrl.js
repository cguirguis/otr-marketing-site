(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('TicketCtrl', TicketCtrl);

    TicketCtrl.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$q', 'ENV', 'CacheService'];
    function TicketCtrl($rootScope, $scope, $state, $stateParams, $q, ENV, CacheService) {
        var vm = this;

        // State details
        vm.selectedState = _.find($rootScope.statesList, function(o) {
            return o.abbreviation == $stateParams.stateCode;
        });

        // Session data
        vm.session = CacheService;

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
        vm.submitTicketInfoStep = submitTicketInfoStep;
        vm.continueToPayment = continueToPayment;

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
            };

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

            if (vm.session.model.selectedCourt && vm.session.model.selectedCourt.originalObject) {
                if (vm.session.model.selectedCourt.originalObject.courtId != null) {
                    return false;
                }
            }

            return true;
        }

        function submitCourtStep() {
            vm.isCourtFormSubmitted = true;

            if (vm.session.model.selectedCourt == null || vm.session.model.selectedCourt.originalObject == null || vm.session.model.selectedCourt.originalObject.courtId == null) {
                return false;
            }

            var court = vm.session.model.selectedCourt.originalObject;
            // Set the selected court in the citation
            vm.session.model.citation.court = {
                courtId : court.courtId,
                location: court.address.city + ", " + court.address.stateCode
            };

            // Go to ticket info step
            $state.go('default-template.fight.info', {});

            console.log("court: ", vm.session.model.selectedCourt.originalObject);
            console.log("citation with court: ", vm.session.model.citation);
        }

        function submitPhotoStep() {
            vm.isImgFormSubmitted = true;

            if (vm.imgContent != null) {
                $state.go('default-template.fight.court', {});
            }
        }

        function submitTicketInfoStep() {
            vm.dataLoading = true;
            vm.isTicketInfoFormSubmitted = true;

            // Update the citation
            var dataObj = {
                citationIdString: vm.session.model.citation.citationId,
                request: {
                    citation: vm.session.model.citation
                }
            };

            otrService.updateCitationUsingPUT(dataObj)
                .then(
                    function (response) {
                        // if we haven't yet created a new case, create one now
                        if (vm.session.model.case == null) {
                            return otrService.createCaseUsingPOST(dataObj)
                        } else {
                            var params = {
                                caseId: vm.session.model.case.caseId,
                                request: {
                                    case: vm.session.model.case
                                }
                            };
                            return otrService.findLawfirmMatchForCaseUsingPOST(params);
                            //return CasesService.rematchCase(vm.session.model.case.caseId);
                        }
                    },
                    function (error) {
                        console.log("ERROR: Failed to create or rematch case: ", error);
                        return $q.reject(error);
                    }
                )
                .then(
                    function(response) {
                        var newCase = response.theCase;
                        newCase.chanceOfSuccess = response.chanceOfSuccess;
                        newCase.insuranceCostInCents = response.projectedInsuranceCostInCents;
                        vm.session.model.case = newCase;
                        vm.session.model.caseFinancials = newCase.lawfirmCaseDecision.caseFinancials;
                        vm.dataLoading = false;

                        // Go to next step
                        $state.go('default-template.fight.review', {});

                        return otrService.isRefundEligibleUsingGET({caseId: newCase.caseId});
                    },
                    function (error, data, headers) {
                        vm.dataLoading = false;
                        if(error.data.error.errorCode === 501) {
                            vm.isNoLawfirmAvailable = true;
                            vm.caseIdWithNoLawfirm = getCaseIdFromHeader(error.headers);
                        }
                        return $q.reject(error);
                    }
                )
                .then(
                    function(response) {
                        vm.session.model.refundEligibility = {
                            isEligible: response.refundEligibilityType === 'FULL_REFUND',
                            uiReasonMsg: response.uiReasonMsg
                        }
                    }
                );
        }

        function continueToPayment() {
            $state.go('default-template.fight.payment', {});
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

                        var citation = response.citation;

                        // set some defaults
                        citation.citationIssueDateUTC = new Date();
                        citation.violationCount = 1;
                        citation.involvesAccident = false;
                        citation.isPastDue = false;
                        vm.session.model.citation = citation;

                        return citation;
                    },
                    function (error) {
                        console.error('ERROR creating citation from image: ', error);
                        return $q.reject(error);
                    }
                );
        }

        function fineAmountUpdated() {
            vm.session.model.citation.fineAmount = $filter('currencyToInt')(vm.tempFineAmount);
        }

        function getCaseIdFromHeader(headers) {
            var location = headers('Location');
            var index = location.lastIndexOf('/');
            return location.substring(index + 1, location.length);
        }

        /*function submitFindMeLawyerInfo() {

            vm.isRequestForLawyerLoading = true;
            console.log('this is ', vm.caseIdWithNoLawfirm);
            CasesService.requestLawyer({
                caseId: vm.caseIdWithNoLawfirm,
                phoneNumber: vm.phoneNumber,
                offerPrice: vm.offerPrice})
                .then(
                function(response) {
                    vm.isRequestForLawyerLoading = false;
                    vm.isRequestForLawyerSuccess = true;
                    $state.go('topnav.dashboard', {hasRequestedForLawyer: true});
                }
            );
        }*/

    }
})();