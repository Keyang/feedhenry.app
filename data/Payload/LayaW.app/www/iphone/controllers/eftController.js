layaApp.controller('eftController', function($scope, $location, $rootScope, utilsService, submitClaimService) {

    'use strict';
    /**
     * eftInit
     * Initialisation function for setting header and dynamic height
     * @Author Ashish Bhargava
     */
    $scope.eftInit = function() {
        $('.homeImg').show();
        $('#homeHeader').show();
        var memberName = '';
        $('.headerTxt').html('bank details');

        var tempHeight = $(window).height() - $('.homeHeader').height();
        $('.container').height(tempHeight);
        var memberDetails = '';

        $(window).resize(function() {
            var tempHeight = $(window).height() - $('.homeHeader').height();
            $('.container').height(tempHeight);
            var tempCanvasHeight = $('.container').height() - $('.homeImg').height();
            $('.whiteCanvas').css('min-height', tempCanvasHeight - 95);
        });
        setTimeout(function() {
            $('#eftDate').val($scope.currentDate());
        }, 50);
        if (localStorage.getItem('memberDetails') !== null)
            utilsService.decrypt(localStorage.getItem('memberDetails'), function(err, res) {
                memberDetails = JSON.parse(res);
                if (memberDetails.firstName === undefined) {
                    memberDetails.firstName = '';
                    memberDetails.surName = '';
                }
                else {
                    memberName = memberDetails.firstName + ' ' + memberDetails.surName;
                }
            });

        $scope.eftForm = {
            'name': memberName
        };

        $("#submitClaim").on('click', function() {
            $scope.saveEft();
            $scope.$apply();
        });
    };

    /**
     * confirm
     *
     * Function to show declaration popup
     * 
     */
    $scope.confirm = function() {
        $("input").blur();
        var bicRegex = new RegExp("[a-zA-Z]{4}[a-zA-Z]{2}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?");
        // var ibanRegex = new RegExp("[a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{4}[0-9]{7}([a-zA-Z0-9]?){0,16}");
        var ibanRegex = new RegExp("^IE[0-9]{2}[A-Z]{4}[0-9]{14}$");
        $scope.eftForm.iban = angular.uppercase($scope.eftForm.iban);        
        $scope.eftForm.bic = angular.uppercase($scope.eftForm.bic);

        if ($scope.eftForm === undefined || $scope.eftForm.bankAdd === '' || $scope.eftForm.bankName === '' || $scope.eftForm.bic === '' || $scope.eftForm.iban === '' || $scope.eftForm.name === '' || $scope.eftForm.bankAdd === null || $scope.eftForm.bankName === null || $scope.eftForm.bic === null || $scope.eftForm.iban === null || $scope.eftForm.name === null || $scope.eftForm.bankAdd === undefined || $scope.eftForm.bankName === undefined || $scope.eftForm.bic === undefined || $scope.eftForm.iban === undefined || $scope.eftForm.name === undefined) {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Please fill all the fields.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }

        else if (!ibanRegex.test($scope.eftForm.iban)) {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Please enter valid IBAN code.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }

        else if (!bicRegex.test($scope.eftForm.bic)) {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Please enter valid BIC code.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }

        else {
            $(".code-input").hide();            
            $rootScope.popupButtonGroup = 'eftConfirm';        
            $rootScope.showHideMessageActionPopup('DECLARATION & CONSENT','I declare that the expenses detailed on this form were incurred by me and/or my dependants covered under my membership in respect of service received during the subscription year, on the recommendation of registered medical practitioners. I declare that, to the best of my knowledge, the foregoing statements are true in every respect. Receipts maybe be needed for verification purposes, after the claim has been submitted.', true);
            var topHeight = ($rootScope.windowHeight / 2) / 2;
            $('.popup').css('margin-top', topHeight + 'px');
            /*if ($rootScope.platform != "Android") {
                setTimeout(function() {
                    var tempHeight = ($(window).height() - $('.popup').height()) * 0.20;
                    $('.popup').css('margin-top', tempHeight + 'px');
                }, 10);
            }*/            
        }
    }

    /**
     * saveEft
     *
     * Function saving eft details and making a service call to save claim on cloud and saving claim locally as well
     * 
     */
    $scope.saveEft = function() {
        $('.focusB').focus();
        var currentClaim = [];
        var eftForm = {
            'bankAdd': $scope.eftForm.bankAdd,
            'bankName': $scope.eftForm.bankName,
            'bic': $scope.eftForm.bic,
            'date': $scope.eftForm.date,
            'iban': $scope.eftForm.iban,
            'name': $scope.eftForm.name
        };        

        setTimeout(function() {
            var tempHeight = ($(window).height() - $('.errorPopup').height()) * 0.30;
            $('.infoPopup').css('margin-top', tempHeight + 'px');
        }, 10);

        if (localStorage.getItem('claimList') === null) {
            $scope.claimListVal = null;
        }
        else
        {
            utilsService.decrypt(localStorage.getItem('claimList'), function(err, res) {
                $scope.claimListVal = JSON.parse(res);
            });
        }

        if ($scope.claimListVal === null) {
            var claimListArray = [];
            if ($rootScope.receiptList.length !== 0) {
                for (var j = 0; j < $rootScope.receiptList.length; j++) {
                    $rootScope.receiptList[j].treatmentDate = $scope.currentDate();
                    currentClaim.push($rootScope.receiptList[j]);
                    claimListArray.push($rootScope.receiptList[j]);
                }
                var memDetailsJson = "";
                var eftJson = "";
                var claimJson = "";
                //fetching member details.
                utilsService.decrypt(localStorage.getItem('memberDetails'), function(err, res) {
                    console.log(res);
                    memDetailsJson = JSON.parse(res);
                    memDetailsJson["phoneNo"] = $rootScope.mobileNo;
                });                
                var finalJson = {
                    "eft": eftForm,
                    "memberDetails": memDetailsJson,
                    "receipts": currentClaim
                };


                console.log(finalJson);                

                $(".masking").show();
                //service layer call to send data to cloud
                submitClaimService.submitClaim(finalJson, function(err, res) {
                    if (res) {
                        localStorage.setItem('eftFlag', true);
                        utilsService.encrypt(JSON.stringify(claimListArray), function(err, res) {
                            localStorage.setItem('claimList', res);
                        });
                        $(".masking").hide();
                        $rootScope.infoHeader = 'CLAIM SUBMITTED';
                        $('.infoText').html('Your claim has been successfully submitted. Your claim shall be processed in rotation.' + '</br></br>' + 'Please note all claims are paid in accordance with our scheme rules and table of benefits.');
                        $('.blackMasking').show();
                        $rootScope.infoFlag = true;
                        $scope.$apply();
                        setTimeout(function() {
                            var tempHeight = ($(window).height() - $('.errorPopup').height()) * 0.30;
                            $('.infoPopup').css('margin-top', tempHeight + 'px');
                        }, 10);
                        $('#menu').trigger('close.mm');
                        $location.path('/reviewClaims');
                        $rootScope.receiptVal = [];

                    }
                    else {
                        $(".masking").hide();
                        $rootScope.infoHeader = 'ERROR';
                        $('.infoText').html(err);
                        $('.blackMasking').show();
                        $rootScope.infoFlag = true;
                        $scope.$apply();
                    }
                });
            }
            else {
                $(".masking").hide();
            }
        } else {
            var claimListArray = $scope.claimListVal;
            if ($rootScope.receiptList.length !== 0) {
                for (var k = 0; k < $rootScope.receiptList.length; k++) {
                    $rootScope.receiptList[k].treatmentDate = new Date();
                    currentClaim.push($rootScope.receiptList[k]);
                    claimListArray.push($rootScope.receiptList[k]);
                }
                var memDetailsJson = "";
                var eftJson = "";
                var claimJson = "";
                //fetching member details.
                utilsService.decrypt(localStorage.getItem('memberDetails'), function(err, res) {
                    console.log(res);
                    memDetailsJson = JSON.parse(res);
                    memDetailsJson["phoneNo"] = $rootScope.mobileNo;
                });

                var finalJson = {
                    "eft": eftForm,
                    "memberDetails": memDetailsJson,
                    "receipts": currentClaim
                }
                                
                $(".masking").show();
                //service layer call to send data to cloud
                submitClaimService.submitClaim(finalJson, function(err, res) {
                    if (res) {
                        localStorage.setItem('eftFlag', true);
                        $(".masking").hide();

                        utilsService.encrypt(JSON.stringify(claimListArray), function(err, res) {
                            localStorage.setItem('claimList', res);
                        });
                        $rootScope.infoHeader = 'CLAIM SUBMITTED';
                        $('.infoText').html('Your claim has been successfully submitted. Your claim shall be processed in rotation.' + '</br></br>' + 'Please note all claims are paid in accordance with our scheme rules and table of benefits.');
                        $('.blackMasking').show();
                        $rootScope.infoFlag = true;
                        $scope.$apply();
                        $('#menu').trigger('close.mm');
                        $rootScope.receiptList = [];
                        $rootScope.receiptVal = [];
                        $location.path('/reviewClaims');

                    }
                    else {
                        $(".masking").hide();
                        $rootScope.infoHeader = 'ERROR';
                        $('.infoText').html(err);
                        $('.blackMasking').show();
                        $rootScope.infoFlag = true;
                        $scope.$apply();
                    }
                });
            }
        }

    };

    /**
     * currentDate
     *
     * Function to return current date in dd mmm yyyy
     * 
     */
    $scope.currentDate = function() {
        var d = new Date();
        var monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        var day = d.getDate(); 
        day = day < 10 ? "0" + day : "" + day;
        return day  + ' ' + monthArr[d.getMonth()] + ' ' + d.getFullYear();
        // return d.getDate() + ' ' + monthArr[d.getMonth()] + ' ' + d.getFullYear();
    };

    /**
     * showBankDeatilsInforPopup
     *
     * Function to show bank details information popup
     * 
     */
    $scope.showBankDeatilsInforPopup = function() {
        $('input').blur();
        $rootScope.infoHeader = 'INFORMATION';
        $('.infoText').html('To ensure your claims are paid as speedily as possible we will pay any claims directly into the account you supply. This information only needs to be provided once, however, if your bank details change you can change the details using the Amend My Bank Details option, before you submit a new claim. The details are stored only for the processing of claims and billing. They will not be stored on your mobile device or with third parties other than for processing.');
        $('.blackMasking').show();
        $rootScope.infoFlag = true;
        setTimeout(function() {
            var tempHeight = ($(window).height() - $('.errorPopup').height()) * 0.30;
            $('.infoPopup').css('margin-top', tempHeight + 'px');
        }, 10);
        $(".infoText").addClass("bankDetailsInfoPopup");
    };


    //function to set the focus to the text field for selected option
    $scope.setFocus = function(id) {
        $("#" + id).focus();
    }

});
