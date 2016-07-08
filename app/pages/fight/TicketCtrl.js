(function () {
    'use strict';

    angular
        .module('brochure')
        .controller('TicketCtrl', TicketCtrl);

    TicketCtrl.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$q', '$filter', 'ENV', 'CacheService', 'StripeService', '$uibModal'];
    function TicketCtrl($rootScope, $scope, $state, $stateParams, $q, $filter, ENV, CacheService, StripeService, $uibModal) {
        var vm = this;

        // State details
        vm.selectedState = _.find($rootScope.statesList, function(o) {
            return o.abbreviation == $stateParams.stateCode;
        });

        // Session data
        vm.session = CacheService;

        // Upload Image Step
        vm.isImgFormSubmitted = false;
        vm.noTicketOnHand = false;
        vm.isCourtFormSubmitted = false;
        vm.isDateFormSubmitted = false;
        vm.isTicketInfoFormSubmitted = false;
        vm.isPaymentFormSubmitted = false;

        // File upload event handlers
        vm.flowFilesSubmitted = flowFilesSubmitted;
        vm.flowFileSuccess = flowFileSuccess;
        vm.flowFileAdded = flowFileAdded;
        vm.processFile = processFile;

        // Used alongside uploading files
        vm.imgContent = null;

        // checkout
        vm.isNoLawfirmAvailable = false;
        vm.newCard = {};
        vm.isPhoneNumberInvalid = true;
        vm.phoneType = 'MOBILE';
        vm.isCouponApplied = false;
        vm.showCouponInput = false;

        vm.goToStep = goToStep;
        vm.verifyImageUpload = verifyImageUpload;
        vm.removeTicketPhoto = removeTicketPhoto;
        vm.submitPhotoStep = submitPhotoStep;
        vm.formatMatchingCourtsResponse = formatMatchingCourtsResponse;
        vm.findMatchingCourts = findMatchingCourts;
        vm.isCourtFormInError = isCourtFormInError;
        vm.fineAmountUpdated = fineAmountUpdated;
        vm.submitCourtStep = submitCourtStep;
        vm.submitDateStep = submitDateStep;
        vm.showNoTicketFlow = showNoTicketFlow;
        vm.submitTicketInfoStep = submitTicketInfoStep;
        vm.continueToPayment = continueToPayment;
        vm.hideRefCodeInput = hideRefCodeInput;
        vm.removeRefCode = removeRefCode;
        vm.confirmCaseBooking = confirmCaseBooking;
        vm.phoneNumberKeyUpListener = phoneNumberKeyUpListener;
        vm.showLoginModal = showLoginModal;

        var otrService = $rootScope.otrService || new OtrService({domain: ENV.apiEndpoint});


        // ----- PUBLIC METHODS -------------------------------------------------------

        (function initController() {
            $scope.$on('$viewContentLoaded', function() {
                if ($state.current.name == "default-template.fight.date") {
                    // Load calendar dates
                    var today = new Date();
                    vm.session.model.citation.date = today;
                    vm.session.model.citation.courtDate = today;

                    $("#ticket-datepicker").kendoDatePicker({
                        depth: "month",
                        start: "month",
                        value: today,
                        max: today,
                        format: "M/d/yyyy",
                        change: function() {
                            vm.session.model.citation.date = this.value();
                        }
                    });

                    $("#court-datepicker").kendoDatePicker({
                        depth: "month",
                        start: "year",
                        value: today,
                        min: today,
                        format: "MMMM d, yyyy",
                        change: function() {
                            vm.session.model.citation.courtDate = this.value();
                        }
                    });
                } else if ($state.current.name == "default-template.fight.payment") {
                    // get the user's payment methods, if any
                    var currentUser = vm.session.model.currentUser;
                    console.log("Attempting to retrieve payment methods for user: ", currentUser.userId);

                    StripeService.getPaymentMethodsForUser(currentUser.userId)
                        .then(
                        function(paymentMethods) {
                            vm.paymentMethods = paymentMethods;
                            vm.selectedPaymentMethod = _.find(vm.paymentMethods, { isDefault : true });
                        }
                    );

                    vm.newCard.firstName = currentUser.firstName;
                    vm.newCard.lastName = currentUser.lastName;
                }
            });

            $rootScope.$on("user:logged-in", function() {
                // If on review step, proceed to payment
                // view after user signs in
                if ($state.current.name == "default-template.fight.review") {
                    vm.continueToPayment();
                }
            });
        })();

        function goToStep(stepName, stepNumber) {
            if (vm.session.model.currentStep <= stepNumber) {
                return;
            }

            $state.go("default-template.fight." + stepName,
                {
                    stateCode: vm.selectedState.abbreviation,
                    stateName: vm.selectedState.name
                });
        }

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
                    vm.session.model.citation.imgContent = vm.imgContent;
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
            vm.session.model.citation.imgContent = null;
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

        function submitPhotoStep() {
            vm.isImgFormSubmitted = true;

            if (vm.imgContent != null) {
                $state.go('default-template.fight.info', {});
                vm.session.model.currentStep++;
            }
        }

        function showNoTicketFlow() {
            $state.go('default-template.fight.info', {});
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
            $state.go('default-template.fight.date', {});
            vm.session.model.currentStep++;

            console.log("court: ", vm.session.model.selectedCourt.originalObject);
            console.log("citation with court: ", vm.session.model.citation);
        }

        function submitTicketInfoStep() {
            vm.dataLoading = true;
            vm.isTicketInfoFormSubmitted = true;

            // TODO - Add email to citation
            //

            // Court is required to do a citation update
            // add placeholder court
            vm.session.model.citation.court = {
                courtId : 348,
                location: "Shoreline, WA"
            };

            // Update the citation
            var dataObj = {
                citationIdString: vm.session.model.citation.citationId,
                updateCitationRequest: {
                    citation: vm.session.model.citation
                }
            };

            otrService.updateCitationUsingPUT(dataObj)
                .then(
                    function (response) {
                        console.log("Update citation response: " + response);
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
                        console.log("Create case response: " + JSON.stringify(response));
                        var newCase = response.theCase;
                        newCase.chanceOfSuccess = response.chanceOfSuccess;
                        newCase.insuranceCostInCents = response.projectedInsuranceCostInCents;
                        vm.session.model.case = newCase;
                        vm.session.model.caseFinancials = newCase.lawfirmCaseDecision.caseFinancials;
                        vm.dataLoading = false;

                        return otrService.isRefundEligibleUsingGET({caseId: newCase.caseId});
                    },
                    function (error) {
                        vm.dataLoading = false;
                        if (error.body.error && error.body.error.uiErrorMsg) {
                            vm.errorMessage = error.body.error.uiErrorMsg;

                        } else if (error.body.error.errorCode === 501) {
                            vm.isNoLawfirmAvailable = true;
                            vm.caseIdWithNoLawfirm = getCaseIdFromHeader(error.config.headers);
                        }
                        return $q.reject(error);
                    }
                )
                .then(
                    function(response) {
                        console.log("refundEligibility response: " + JSON.stringify(response));
                        vm.session.model.refundEligibility = {
                            isEligible: response.refundEligibilityType === 'FULL_REFUND',
                            uiReasonMsg: response.uiReasonMsg
                        };

                        // Go to next step
                        $state.go('default-template.fight.court', {});
                        vm.session.model.currentStep++;
                    }
                );
        }

        function submitDateStep() {
            vm.isDateFormSubmitted = true;

            // Go to ticket info step
            $state.go('default-template.fight.review', {});
            vm.session.model.currentStep++;
        }

        function continueToPayment() {

            // If user not logged in, show login modal
            if (!vm.session.model.currentUser) {
                vm.showLoginModal();
                return;
            }

            $state.go('default-template.fight.payment', {});
            vm.session.model.currentStep++;
        }

        function hideRefCodeInput() {

            vm.showCouponInput = false;

            if (vm.refCode != null) {
                vm.userInputRefCode = vm.refCode;
            }
        }

        function removeRefCode() {
            /* TODO - hook this up

            if (vm.refCode != null) {

                vm.refCodeDataLoading = true;

                CasesService.rematchCase(vm.newCase.caseId)
                    .then(
                    function(response) {
                        vm.newCase = response.theCase;
                        vm.newCase.chanceOfSuccess = response.chanceOfSuccess;
                        vm.caseFinancials = vm.newCase.lawfirmCaseDecision.caseFinancials;
                        vm.refCode = null;
                        vm.showCouponInput = false;
                        vm.userInputRefCode = null;
                        vm.refCodeDataLoading = false;
                    },
                    function (response) {
                        vm.refCodeDataLoading = false;
                        if(response.data.error.errorCode === 501) {
                            vm.isNoLawfirmAvailable = true;
                            vm.caseIdWithNoLawfirm = getCaseIdFromHeader(response.headers);
                        }
                        return $q.reject(response);
                    }
                )
            }
            */
        }

        function applyRefCode() {
            /* TODO - hook this up

            if (vm.userInputRefCode == null || vm.userInputRefCode == '') {
                //vm.refCodeError = 'Please enter a referral or discount code';
                return false;
            }

            vm.refCodeDataLoading = true;

            RefCodeService.applyRefCode(vm.newCase.caseId, vm.userInputRefCode)
                .then(
                function(response) {
                    console.log('newCase with refcode applied: ', response);
                    vm.newCase = response.theCase;
                    vm.newCase.chanceOfSuccess = response.chanceOfSuccess;
                    vm.caseFinancials = vm.newCase.lawfirmCaseDecision.caseFinancials;
                    vm.refCode = vm.userInputRefCode;
                    vm.showCouponInput = false;
                    vm.refCodeDataLoading = false;
                },
                function(error) {
                    console.log('ERROR: Could not apply RefCode: ', error);
                    vm.refCodeDataLoading = false;
                    vm.refCodeError = error.data.error.uiErrorMsg;
                    return $q.reject(error);
                }
            );
            */
        }

        function phoneNumberKeyUpListener() {
            if(vm.phoneNumber) {
                vm.isPhoneNumberInvalid = vm.phoneNumber.length < 10;
            } else {
                vm.isPhoneNumberInvalid = true;
            }
        }

        function confirmCaseBooking(isValid) {

            vm.isPaymentFormSubmitted = true;
            vm.dataLoading = true;

            if (vm.selectedPaymentMethod == null || vm.selectedPaymentMethod == '') {

                // Only continue if the form is valid
                if (!isValid) {
                    console.log('errors on form');
                    vm.dataLoading = false;
                    return;
                }

                vm.newCard.name = vm.newCard.firstName + " " + vm.newCard.lastName;

                stripe.card.createToken(vm.newCard)
                    .then(
                        // Persist the card to the user's account
                        function(response) {
                            console.log('token created for card ending in ', response.card.last4);
                            console.log('full response from stripe: ', response);
                            return StripeService.addNewPaymentMethodForUser(vm.session.model.currentUser.userId, response.id);
                        },
                        function(error) {
                            console.log('ERROR: Failed to create Stripe token: ', error);
                            console.log('Error Msg: ', error.message + ', Error code: ', error.code);
                            FlashService.Error(error.message);
                            vm.dataLoading = false;
                            return $q.reject(error);
                        }
                    )
                    .then(
                        // confirm the case
                        function() {
                            console.log('attempting to confirm the case');

                            // TODO - update case using otrService
                            var params = {
                                caseId: vm.session.model.case.caseId,
                            };

                            return otrService.confirmBookingUsingPOST(params);
                            //return CasesService.confirmCaseAsBooked(vm.newCase.caseId)
                        }
                    )
                    .then(
                        // authorize payment for the case
                        function() {
                            var params = {
                                request: {
                                    user: {
                                        userId: vm.session.model.currentUser.userId,
                                        phoneNumbers: [{phoneNumber: vm.phoneNumber, type: vm.phoneType}]
                                    }
                                }
                            };
                            return otrService.updateUserDetailsUsingPUT(params);
                        }
                    )
                    .then(
                        function() {
                            console.log('attempting to authorize case payment');
                            return CasePaymentService.authorizeCasePayment(vm.session.model.case.caseId, null);
                        }
                    )
                    .then(
                        function() {
                            console.log('Running recordGoogleAdwordsConversion()...');
                            // TODO - hook this up
                            //return vm.recordGoogleAdwordsConversion();
                        }
                    )
                    .then(
                        function() {
                            vm.dataLoading = false;
                            $rootScope.$broadcast('NewCaseEvent');

                            // TODO - navigate to appropriate view
                            //$state.go('topnav.case-details', {caseId: vm.session.model.case.caseId, isNew: true})
                        }
                    )
                    .catch(
                        function (error) {
                            console.log('ERROR: Failed to process payment form: ', error);
                            if (error.data != null && error.data.error != null) {
                                FlashService.Error(error.data.error.uiErrorMsg);
                            }
                            vm.dataLoading = false;
                            return $q.reject(error);
                        }
                    );
            } else {
                console.log('attempting to confirm the case');
                CasesService.confirmCaseAsBooked(vm.session.model.case.caseId)
                    .then(
                        // authorize payment for the case
                        function() {
                            var params = {
                                request: {
                                    user: {
                                        userId: vm.session.model.currentUser.userId,
                                        phoneNumbers: [{phoneNumber: vm.phoneNumber, type: vm.phoneType}]
                                    }
                                }
                            };
                            return otrService.updateUserDetailsUsingPUT(params);
                        }
                    )
                    .then(
                        function() {
                            console.log('attempting to authorize case payment');
                            return CasePaymentService.authorizeCasePayment(vm.session.model.case.caseId, vm.selectedPaymentMethod.cardId);
                        }
                    )
                    .then(
                        function() {
                            console.log('Running recordGoogleAdwordsConversion()...');
                            return vm.recordGoogleAdwordsConversion();
                        }
                    )
                    .then(
                        function() {
                            vm.dataLoading = false;
                            $rootScope.$broadcast('NewCaseEvent');
                            $state.go('topnav.case-details', {caseId: vm.session.model.case.caseId, isNew: true})
                        }
                    )
                    .catch(
                        function (error) {
                            console.log('ERROR: Failed to process payment form: ', error);
                            vm.dataLoading = false;
                            return $q.reject(error);
                        }
                    );
            }
        }

        function showLoginModal() {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '/login.html',
                controller: 'LoginCtrl as vm',
                size: 'md',
                resolve: {
                    user: function () {
                        return $scope.user;
                    }
                }
            });

            modalInstance.result.then(
                function (selectedItem) {
                    $scope.selected = selectedItem;
                },
                function () {
                    console.log('Modal dismissed at: ' + new Date());
                }
            );
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
                        citation.imgContent = vm.session.model.citation.imgContent;
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