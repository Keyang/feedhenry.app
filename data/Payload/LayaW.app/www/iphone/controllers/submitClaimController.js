layaApp.controller('submitClaimController', function($scope, utilsService, $location, $rootScope, submitClaimService, historyService) {

    'use strict';
    var firstClaimInit = true;



    /**
     * claimInit
     *
     * Initailsation function setting dynamic height and adding windows resize events and keypress events.
     * @Author Ashish Bhargava
     */
    $scope.claimInit = function() {
        $('.homeImg').hide();
        $('#homeHeader').show();
        $('.headerTxt').html('submit claim');
        if ($rootScope.receiptVal.length === 0) {
            $rootScope.showSummaryBtn = false;
        }

        $scope.amendFlag = localStorage.getItem('eftFlag');
        var tempHeight = $(window).height() - $('.homeHeader').height();
        $('.container').height(tempHeight);
        $('.claimDwnArrow').css('left', ($('#claimTopBarMenuOuter li').width() - $('.claimDwnArrow').width()) / 2);

        // adjusting claim down arrow
        $(window).resize(function() {
            if (($(window).height() < $rootScope.windowHeight) && $('.claimReceiptList').is(':visible')) {
                return;
            }
            // alert("pass");
            var tempHeight = $(window).height() - $('.homeHeader').height();
            $('.container').height(tempHeight);
            $scope.tempCanvasHeight = $('.container').height() - $('.claimTopBarOuter').height();
            $scope.tempCanvasHeight = $scope.tempCanvasHeight - 65;
            $('.whiteCanvas').css('min-height', $scope.tempCanvasHeight);
            $scope.$apply(function() {
                $('.claimDwnArrow').css('left', ($('#claimTopBarMenuOuter li').width() - $('.claimDwnArrow').width()) / 2);
            });            
        });



        $('.claimReceiptCanvas :input').live('focus', function(e) {
            if ($rootScope.inputElementFlag == true) {
                var id = this.id;
                $('#' + id).blur();
            }            
        });        

        $('.claimReceiptCanvas :input').live('blur', function(e) {
            if ($rootScope.inputElementFlag == false) {
                var id = 'receiptTotalIndex' + $rootScope.receiptVal.length;
                var cls = 'receiptTxtIndex' + $rootScope.receiptVal.length;
                if ($('.claimReceiptList').css('display') === 'block') {
                    var tempTxt = $('.' + cls).val();
                    var tempAmt = $('#' + id).val();
                    for (var i = 1; i <= $rootScope.receiptVal.length; i++) {
                        id = 'receiptTotalIndex' + [i];
                        cls = 'receiptTxtIndex' + [i];
                        tempTxt = $('.' + cls).val();
                        tempAmt = $('#' + id).val();
                        if (!$.trim(tempAmt).length || !$.trim(tempTxt).length) { // zero-length string AFTER a trim
                            $rootScope.inputElementFlag = true;
                            $rootScope.infoHeader = 'ERROR';
                            if (!$.trim(tempAmt).length) {
                                $('.infoText').html('Treatment total must be a number or cannot left empty.');
                            }else {
                                $('.infoText').html('Field cannot be left blank.');
                            }
                            $('.blackMasking').show();
                            $rootScope.infoFlag = true;
                            $rootScope.$apply();
                        }
                    }
                }
            }
        });

        $('.claimReceiptCanvas :input').live('keyup', function(e) {
            var id = 'receiptTotalIndex' + $rootScope.receiptVal.length;
            var cls = 'receiptTxtIndex' + $rootScope.receiptVal.length;
            if ($('.claimReceiptList').css('display') === 'block') {
                var tempTxt = $('.' + cls).val();
                var tempAmt = $('#' + id).val();

                /*for (var i = 1; i <= $rootScope.receiptVal.length; i++) {
                 id = 'receiptTotalIndex' + [i];
                 cls = 'receiptTxtIndex' + [i];
                 tempTxt = $('.' + cls).val();
                 tempAmt = $('#' + id).val();
                 if (!$.trim(tempAmt).length && !$.trim(tempTxt).length) { // zero-length string AFTER a trim
                 $rootScope.infoHeader = 'ERROR';
                 $('.infoText').html('Field cannot be left blank.');
                 $('.blackMasking').show();
                 $rootScope.infoFlag = true;
                 $scope.$apply();
                 }
                 }*/

                if ($('.' + cls).val().length > 9) {
                    tempTxt = $('.' + cls).val().substring(0, 9) + '...';
                }
                else {
                    tempTxt = $('.' + cls).val();
                }

                if ($('#' + id).val().length > 6) {
                    tempAmt = $('#' + id).val().substring(0, 6) + '...';
                }
                else {
                    tempAmt = $('#' + id).val();
                }
                $('#cashIconTxt').html('&#8364; ' + '<br>' + tempAmt);
                $('#treatmentTxt').html(tempTxt);
                if (e.keyCode === 13) {
                    $('input').blur();
                }
                $scope.updateTotal();
            }

        });


        $scope.tempCanvasHeight = $('.container').height() - $('.claimTopBarOuter').height();
        $scope.tempCanvasHeight = $scope.tempCanvasHeight - 65;
        $('.whiteCanvas').css('min-height', $scope.tempCanvasHeight);
        $('#preview').hide();
        $('.claimDwnArrow').hide();
        $('#uploadPhoto').show();
        $('#claimDwnArrow').hide();
        $('#camIconArrow').show();
        $('#captureImg').show();                //showing capture reciept image screen

        $rootScope.receipt = {
            'img': '',
            'amount': '',
            'treatmentTotal': '',
            'treatmentDate': '',
            'treatmentType': '',
            'name': ''
        };
        $('#receiptAmt').unbind('keypress');
        $('#treatmentTextArea').unbind('keypress');
//        ------------------Setting keypress event for amount------------------
        $('#receiptAmt').keypress(function(e) {
            var p = e.which;
            if (p == 13) {
                $scope.showTreatmentDiv();
                $scope.$apply();
            }
        });

        var text_max = 50;
        $('#textarea_feedback').html('Characters left: ' + text_max);

        $('#treatmentTextArea').keyup(function() {
            var text_length = $('#treatmentTextArea').val().length;
            var text_remaining = text_max - text_length;
            $('#textarea_feedback').html('Characters left: ' + text_remaining);
        });
        if (localStorage.getItem('memberDetails') === null || localStorage.getItem('memberDetails') === '' || localStorage.getItem('memberDetails') === undefined)
        {
            $rootScope.goEft = false;
            $rootScope.goClaim = true;
            if ($rootScope.receiptVal.length === 0) {
                $rootScope.popupButtonGroup = 'confirmMemDetails';                                
                $rootScope.showHideMessageActionPopup('ENTER MEMBERSHIP DETAILS','Would you like to enter your member details?', true);                
                $rootScope.$apply();
                $('.message-action-popup').css('height', $(window).height());
            }
        }

        //Events below was registered twice as claimInit is called each time for a new receipt.
        //add var firstClaimInit to control this. Need original developer to refactor it.
        if (firstClaimInit) {
            $('#confirmDelBtn').on('click', function() {
                $scope.confirmDel();
                $scope.$apply();
            });

            $('#galleryBtn').on('click', function() {
                $scope.openGallery();
                $scope.$apply();
            });

            $('#cameraBtn').on('click', function() {
                $scope.OpenCamera();
                $scope.$apply();
            });

            $('#cameraActionBtn').on('click', function() {
                $scope.takePhoto();
                $scope.$apply();
            });
            $('#cancelClaimBtn').on('click', function() {
                if ($rootScope.setUrl === '/') {
                    $rootScope.credentials = {};
                    $rootScope.loginRes = undefined;
                    $('.forgotten-pin').show();
                    $rootScope.loginFlag = 'login';
                    $rootScope.secondCredentialsFlag = 'pin';
                    $rootScope.firstcredentialsFlag = 'mobileNo';
                }
                $location.path($rootScope.setUrl);
                $rootScope.receiptVal = [];
                $scope.$apply();
            });
            $('#claimSubmit').on('click', function() {
                $scope.submitClaims();
                $scope.$apply();
            });
            firstClaimInit = false;
        }        
    };

    /**
     * updateTotal
     *
     * Function to update total of all the receipts.
     *
     */
    $scope.updateTotal = function() {
        var total = 0;
        for (var i = 0; i < $rootScope.receiptVal.length; i++) {
            total = total + parseFloat($('#receiptIndex' + (i + 1) + ' .receiptTxtBoxWidth').val());
            if (isNaN(total))
                total = 0;
            $('#span2').html('&#8364; ' + total.toFixed(2));
        }
    };

    /**
     * showPreview
     *
     * Function to enable user to select image from photo library and show its preview.
     *
     */
    $scope.showPreview = function() {
        navigator.camera.getPicture(onSuccess, onFail, {quality: $rootScope.cordovaConfig.imageQuality,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            targetWidth: $rootScope.cordovaConfig.width,
            targetHeight: $rootScope.cordovaConfig.height,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            // saveToPhotoAlbum: true,
            correctOrientation: true

        });

        function onSuccess(imageData) {           
            $rootScope.receipt.img = imageData;
            $('#preview').show();
            $('.imagePreview').css('background-image', 'url(' + imageData + ')');
            $('#uploadPhoto').hide();
            $('.imagePreview').height($('.whiteCanvas').height() * 0.75);
            $('.imagePreview').width($('.whiteCanvas').width() * 0.50);
            $('.container').scrollTop(1000000);
        }

        function onFail(message) {
            $rootScope.infoHeader = 'Warning';            
            $('.infoText').html("No image selected.");
            $('.blackMasking').show();
            $('#preview').hide();
            $('#uploadPhoto').show();
            $rootScope.infoFlag = true;
            setTimeout(function() {
                var tempHeight = ($(window).height() - $('.errorPopup').height()) * 0.30;
                $('.infoPopup').css('margin-top', tempHeight + 'px');
            }, 10);
            $scope.$apply();
        }

    };

    /**
     * showReceiptAmt
     *
     * Function to show 'add amount' screen .
     *
     */
    $scope.showReceiptAmt = function() {
        $('#preview').hide();
        $('#captureImg').hide();
        $('#receiptAmout').show();
        $('.claimDwnArrow').hide();
        $('#cashIconArrow').show();
        $('#span1').text('Enter the ');
        $('#span2').text('total  ');
        $('#span3').text('of your receipt');
        $('#camIcon').attr('src', 'images/photo_blue.png');
        $('#camIconTxt').show();
        if ($('#cashIcon').attr('src') === 'images/cash_blue.png') {
            $('#cashIcon').attr('src', 'images/cash_blue.png');
        } else
            $('#cashIcon').attr('src', 'images/cash_pink.png');
        if ($rootScope.platform != 'Win32NT') {
            $('#receiptAmt').focus();
        }
        historyService.push({
            "parent": "submitClaim",
            "backAction": function() {
                $("#uploadPhoto").hide();
                $('#captureImg').show();
                $("#preview").show();
                $("#receiptAmout").hide();
            }
        });
    };

    /**
     * showTreatmentDiv
     *
     * Function to show 'add treatment type' screen .
     *
     */
    $scope.showTreatmentDiv = function() {
        $("input").blur();
        if ($scope.claimAmount === undefined || $scope.claimAmount === null || $scope.claimAmount === '' || parseFloat($scope.claimAmount) === 0) {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html($rootScope.invalidNumberMessage);
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else {
            $rootScope.receipt.treatmentTotal = $scope.claimAmount;
            var tempAmt = '';
            if ($scope.claimAmount.length > 6) {
                tempAmt = $scope.claimAmount.substring(0, 6) + '...';
            }
            else {
                tempAmt = $scope.claimAmount;
            }
            $('#preview').hide();
            $('#captureImg').hide();
            $('#receiptAmout').hide();
            $('#datePickerDiv').hide();
            $('#treatmentDiv').show();
            $('.claimDwnArrow').hide();
            $('#treatmentIconArrow').show();
            $('#span1').text('What Type of ');
            $('#span2').text('treatment  ');
            $('#span3').text('is the claim for?');
            $('#treatmentIcon').attr('src', 'images/treatment_pink.png');
            $('#cashIconTxt').html('&#8364; ' + '<br>' + tempAmt);
            $('#cashIconTxt').show();
            $('#cashIcon').attr('src', 'images/cash_blue.png');
            // setTimeout(function(){
            if ($rootScope.platform != 'Win32NT') {
                $('#treatmentTextArea').focus();
            }            
            // }, 500);
            historyService.push({
                "parent": "submitClaim",
                "backAction": function() {
                    $("#receiptAmout").show();
                    $("#treatmentDiv").hide();
                }
            });
        }
    };

    $scope.showImageOption = function() {
        $('#preview').hide();
        $('#uploadPhoto').show();
    }

    $scope.showCamPopup = function() {
        if ($rootScope.imgCaptureInst === true) {
            $rootScope.popupButtonGroup = 'confirmCamAction';
            $rootScope.imgCaptureInst = false;
            $rootScope.showHideMessageActionPopup('PHOTO RECEIPT GUIDELINES','Ensure to capture the entire receipt when capturing the image.<br><br>Please ensure all receipts clearly display the name of the patient, the cost incurred and the date of the visit.<br><br>Please keep all original receipts in case the image sent is not of sufficient quality.', true);
            var topHeight = ($rootScope.windowHeight / 2) / 2;
            $('.popup').css('margin-top', topHeight + 'px');
        }
        else {
            $scope.takePhoto();
        }
    }

    /**
     * showTreatmentDiv
     *
     * Function to open camera on device and click image and setting it to the receipt.
     * plugin name - cordova plugin add org.apache.cordova.camera
     */
    $scope.takePhoto = function() {
      
        var savePhoto = true;
        
        if($rootScope.platform == 'Win32NT')
        {
          savePhoto = false;
        }
      
        // $('#preview').show();
        $('#uploadPhoto').hide();
        // $('.imagePreview').height(($('.whiteCanvas').height() * 0.75) - 20);
        // $('.imagePreview').width($('.whiteCanvas').width() * 0.50);
        $rootScope.showHideMessageActionPopup('','', false);        
        navigator.camera.getPicture(onSuccess, onFail, {quality: $rootScope.cordovaConfig.imageQuality,
            destinationType: Camera.DestinationType.FILE_URI,
//            sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
            targetWidth: $rootScope.cordovaConfig.width,
            targetHeight: $rootScope.cordovaConfig.height,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: savePhoto,
            correctOrientation: true

        });
        function onSuccess(imageData) {
            $rootScope.receipt.img = imageData;                         // Adding image data to JSON so as to create an array of receipt          
            $('#uploadPhoto').hide();            
            $('#preview').show();
            $('.imagePreview').css('background-image', 'url(' + imageData + ')');
            $('.imagePreview').height($('.whiteCanvas').height() * 0.75);
            $('.imagePreview').width($('.whiteCanvas').width() * 0.50);            
            setTimeout(function() {
                $('.imageNextButtonPink').focus();
                $('.container').scrollTop(1000000);
            }, 1000);
        }

        function onFail(message) {
            $('#preview').hide();
            $('#uploadPhoto').show();
//onFail will do nothing as per ticket https://feedhenry.assembla.com/spaces/laya-healthcare-app/tickets/98#/activity/ticket:
            //$rootScope.infoHeader = 'ERROR';
            //$('.infoText').html(message);
            //$('.blackMasking').show();
            //console.log(message);
            //$rootScope.infoFlag = true;
            //setTimeout(function() {
            //var tempHeight = ($(window).height() - $('.errorPopup').height()) * 0.30;
            //$('.infoPopup').css('margin-top', tempHeight + 'px');
            //}, 10);
            //$scope.$apply();
        }
    };

    /**
     * showReceiptSummary
     *
     * Function to show all the receipt entered by the user.
     * 
     */
    $scope.showReceiptSummary = function() {
        $("input").blur();
        var tempVal = $.trim($scope.treatmentType);
        if ($scope.treatmentType === undefined || $scope.treatmentType === null || tempVal === '') {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Please enter treatment type.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else {
            var total = 0;
            var i = 0;
            $rootScope.receipt.treatmentType = $scope.treatmentType;                         // Adding receipt date to JSON so as to create an array of receipt
            var r = $rootScope.receipt;
            var found = false;
            for (i = 0; i < $rootScope.receiptVal.length; i++) {
                var o = $rootScope.receiptVal[i];
                if (o.$$hashKey == $rootScope.receipt.$$hashKey) {
                    found = true;
                    break;
                }
            }
            if (found === false) {
                $rootScope.receiptVal.push($rootScope.receipt);                                  // Adding receipt data to final array
            }
            for (i = 0; i < $rootScope.receiptVal.length; i++) {
                $rootScope.receiptVal[i].name = 'Receipt' + (i + 1);
                $rootScope.receiptVal[i].id = i;
                total = total + parseInt($rootScope.receiptVal[i].treatmentTotal);
            }

            var tempTreatmentType = '';
            if ($scope.treatmentType.length > 10) {
                tempTreatmentType = $scope.treatmentType.substring(0, 10) + '...';
            }
            else {
                tempTreatmentType = $scope.treatmentType;
            }
            $('#treatmentTextArea').focusout();
            setTimeout(function() {
                $('#preview').hide();
                $('#captureImg').hide();
                $('#receiptAmout').hide();
                $('#datePickerDiv').hide();
                $('#treatmentDiv').hide();
                $('.claimDwnArrow').hide();
                $('#receiptIconArrow').show();
                $('.claimReceiptList').show();
                $('#treatmentTxt').html(tempTreatmentType);
                $('#receiptIcon').attr('src', 'images/summary_pink.png');
                $('#treatmentTxt').show();
                $('#treatmentIcon').attr('src', 'images/treatment_blue.png');

                $('#span1').text('Claim total: ');
                $('#span2').html('&#8364; ' + total);
                if (i > 1) {
                    $('#span3').html(' incl ' + '<span id="span4" class="blueTxt" >' + i + ' </span>' + ' receipts');
                }
                else {
                    $('#span3').html(' incl ' + '<span id="span4" class="blueTxt" >' + i + ' </span>' + ' receipt');
                }
                $scope.summaryFlag = true;
                historyService.push({
                    "parent": "submitClaim",
                    "backAction": function() {
                        $(".claimReceiptList").hide();
                        $("#treatmentDiv").show();
                        var treat = r.treatmentType;
                        var total = r.treatmentTotal;
                        var img = r.treatmentImg;
                        $scope.claimAmount = total;
                        $scope.treatmentType = treat;
                        $scope.$apply();
                    }
                });
                setTimeout(function() {
                    $scope.updateTotal();
                    if ($rootScope.receiptVal.length <= 1)
                        $('.container').scrollTop(-100000);
                }, 100);
                if ($rootScope.receiptVal.length <= 1)
                    $('.container').scrollTop(1000000);

                if ($rootScope.platform == "Win32NT") {                    
                    $("span.currencySymbol").css('padding-top', '0px');
                    $(".currencySymbol").css('margin-top', '-0.5px');
                }
            }, 10);
        }
    };


    /**
     * showDelPopup
     *
     * Function to show confirm delete popup.
     * 
     */
    $scope.showDelPopup = function(item) {
        console.log(item);
        $scope.itemDel = item;
        $rootScope.popupButtonGroup = 'deleteReceipt';        
        $rootScope.showHideMessageActionPopup('DELETE RECEIPT?','Are you sure you want to remove this receipt\nfrom the current claim?', true);
    };

    /**
     * confirmDel
     *
     * Function to delete selected receipt.
     * 
     */
    $scope.confirmDel = function() {
        // $('.blackMasking').hide();
        // $('.popup').hide();
        $rootScope.showHideMessageActionPopup('','', false);
        var total = 0;
        $rootScope.popupButtonGroup = '';
        for (var i = 0; i < $rootScope.receiptVal.length; i++) {
            if ($rootScope.receiptVal[i].id === $scope.itemDel.id) {
                $rootScope.receiptVal.splice(i, 1);
            }
        }
        for (i = 0; i < $rootScope.receiptVal.length; i++) {
            $rootScope.receiptVal[i].name = 'Receipt' + (i + 1);            
            total = total + parseFloat($rootScope.receiptVal[i].treatmentTotal);
        }
        $('#span2').html('&#8364; ' + total);
        $('#span3').html(' incl ' + '<span id="span4" class="blueTxt" >' + i + ' </span>' + ' receipt');
        if ($rootScope.receiptVal.length === 0) {
            $('.claimReceiptList').hide();
            $rootScope.showSummaryBtn = false;
            $scope.newReceipt();
        }
        else {
            setTimeout(function() {
                var id = 'receiptTotalIndex' + $rootScope.receiptVal.length;
                var cls = 'receiptTxtIndex' + $rootScope.receiptVal.length;
                if ($('.claimReceiptList').css('display') === 'block') {
                    var tempTxt = $('.' + cls).val();
                    var tempAmt = $('#' + id).val();

                    if ($('.' + cls).val().length > 9) {
                        tempTxt = $('.' + cls).val().substring(0, 9) + '...';
                    }
                    else {
                        tempTxt = $('.' + cls).val();
                    }

                    if ($('#' + id).val().length > 6) {
                        tempAmt = $('#' + id).val().substring(0, 6) + '...';
                    }
                    else {
                        tempAmt = $('#' + id).val();
                    }
                    $('#cashIconTxt').html('&#8364; ' + '<br>' + tempAmt);
                    $('#treatmentTxt').html(tempTxt);
                }
            }, 1000);
        }
        setTimeout(function() {
            $scope.updateTotal();
        }, 100);
    };

    $scope.gotoSummary = function() {
        $('#preview').hide();
        $('#captureImg').hide();
        $('#receiptAmout').hide();
        $('#datePickerDiv').hide();
        $('#treatmentDiv').hide();
        $('.claimDwnArrow').hide();
        $('#receiptIconArrow').show();
        $('.claimReceiptList').show();
        $('#receiptIcon').attr('src', 'images/summary_pink.png');
        $('#treatmentTxt').show();
        $('#treatmentIcon').attr('src', 'images/treatment_blue.png');
        $('#cashIcon').attr('src', 'images/cash_blue.png');
        $("#camIconTxt").show();
        $("#cashIconTxt").show();
        $('#camIcon').attr('src', 'images/photo_blue.png');
        $('#span1').text('Claim total: ');
        var i = $rootScope.receiptVal.length;
        if (i > 1) {
            $('#span3').html(' incl ' + '<span id="span4" class="blueTxt" >' + i + ' </span>' + ' receipts');
        }
        else {
            $('#span3').html(' incl ' + '<span id="span4" class="blueTxt" >' + i + ' </span>' + ' receipt');
        }
        $scope.summaryFlag = true;
        setTimeout(function() {
            $scope.updateTotal();
            if ($rootScope.receiptVal.length <= 1)
                $('.container').scrollTop(-100000);
        }, 100);
        if ($rootScope.receiptVal.length <= 1)
            $('.container').scrollTop(1000000);

        var id = 'receiptTotalIndex' + $rootScope.receiptVal.length;
        var cls = 'receiptTxtIndex' + $rootScope.receiptVal.length;
        if ($('.claimReceiptList').css('display') === 'block') {
            var tempTxt = $('.' + cls).val();
            var tempAmt = $('#' + id).val();

            if ($('.' + cls).val().length > 9) {
                tempTxt = $('.' + cls).val().substring(0, 9) + '...';
            }
            else {
                tempTxt = $('.' + cls).val();
            }

            if ($('#' + id).val().length > 6) {
                tempAmt = $('#' + id).val().substring(0, 6) + '...';
            }
            else {
                tempAmt = $('#' + id).val();
            }
            $('#cashIconTxt').html('&#8364; ' + '<br>' + tempAmt);
            $('#treatmentTxt').html(tempTxt);
        }        
        $scope.updateTotal();
    }

    /**
     * showChangeImgPopup
     *
     * Function to show change image options.
     * 
     */
    $scope.showChangeImgPopup = function(id) {
        $rootScope.popupButtonGroup = 'changeImg';
        $rootScope.showHideMessageActionPopup('CHANGE RECEIPT IMAGE','Complete this action using', true);
        $scope.indexSelected = id;
        $scope.selectedId = 'receiptLi' + (id + 1);
    };

    /**
     * openGallery
     *
     * Function to select image from device gallery.
     * 
     */
    $scope.openGallery = function() {    
        $rootScope.showHideMessageActionPopup('','', false);
        $rootScope.popupButtonGroup = '';
        navigator.camera.getPicture(onSuccess, onFail, {quality: $rootScope.cordovaConfig.imageQuality,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            targetWidth: $rootScope.cordovaConfig.width,
            targetHeight: $rootScope.cordovaConfig.height,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true

        });
        function onSuccess(imageData) {
          // $rootScope.receipt.img = imageData;
            if ($rootScope.platform == 'Win32NT') {
                // iconImage
                $('#' + $scope.selectedId + ' #iconImage').css('background-image', 'url(' + imageData + ')');
            }else {
                $('#' + $scope.selectedId + ' img').attr('src', imageData);
            }
            
            $rootScope.receiptVal[$scope.indexSelected].img = imageData;
        }
        function onFail(message) {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html(message);
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
            console.log(message);
            setTimeout(function() {
                var tempHeight = ($(window).height() - $('.errorPopup').height()) * 0.30;
                $('.infoPopup').css('margin-top', tempHeight + 'px');
            }, 10);
            $scope.$apply();
        }
    };

    /**
     * OpenCamera
     *
     * Function to open camera and click a photo.
     * 
     */
    $scope.OpenCamera = function() {        
        $rootScope.showHideMessageActionPopup('','', false);
        $rootScope.popupButtonGroup = '';
        navigator.camera.getPicture(onSuccess, onFail, {quality: $rootScope.cordovaConfig.imageQuality,
            destinationType: Camera.DestinationType.FILE_URI,
            targetWidth: $rootScope.cordovaConfig.width,
            targetHeight: $rootScope.cordovaConfig.height,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: true,
            correctOrientation: true

        });
        function onSuccess(imageData) {
            // $rootScope.receipt.img = imageData;            
            // $('#' + $scope.selectedId + ' img').attr('src', imageData);
            if ($rootScope.platform == 'Win32NT') {
                // iconImage
                $('#' + $scope.selectedId + ' #iconImage').css('background-image', 'url(' + imageData + ')');
            }else {
                $('#' + $scope.selectedId + ' img').attr('src', imageData);
            }

            $rootScope.receiptVal[$scope.indexSelected].img = imageData;
        }
        function onFail(message) {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html(message);
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
            console.log(message);
            setTimeout(function() {
                var tempHeight = ($(window).height() - $('.errorPopup').height()) * 0.30;
                $('.infoPopup').css('margin-top', tempHeight + 'px');
            }, 10);
            $scope.$apply();
        }
    };

    /**
     * showEft
     *
     * Function to show eft details screen 
     * 
     */
    $scope.showEft = function() {
        $("input").blur();
        $rootScope.receiptList = [];
        for (var i = 1; i <= $rootScope.receiptVal.length; i++) {
            if (parseFloat($('#receiptIndex' + i + ' .changePinTxt').val()) === 0) {
                $rootScope.infoHeader = 'ERROR';
                $('.infoText').html($rootScope.invalidNumberMessage);
                $('.blackMasking').show();
                $rootScope.infoFlag = true;
                return false;               //returning false if any fields is blank
            }
            if (!$('#receiptIndex' + i + ' .changePinTxt').val() || !$('#receiptIndex' + i + ' #treatmentTypeListTxt' + i).val()) {
                $rootScope.infoHeader = 'ERROR';
                $('.infoText').html($rootScope.emptyFieldMessage);
                $('.blackMasking').show();
                $rootScope.infoFlag = true;
                return false;               //returning false if any fields is blank
            }
        }
        ;

        for (var i = 0; i < $rootScope.receiptVal.length; i++) {

            var imageSrc = $('#receiptIndex' + (i + 1) + ' img').data().hehe;  //Extracting base64 string from image source            
            var temp = {
                'img': imageSrc,
                'amount': $('#receiptIndex' + (i + 1) + ' .receiptTxtBoxWidth').val(),
                'treatmentTotal': $('#receiptIndex' + (i + 1) + ' .receiptTxtBoxWidth').val(),
                'treatmentDate': '',
                'treatmentType': $('#receiptIndex' + (i + 1) + ' #treatmentTypeListTxt' + (i + 1)).val(),
                'name': 'Receipt' + (i + 1)
            };
            $rootScope.receiptList.push(temp);

        }
        //checking if member details is not filled
        if (localStorage.getItem('memberDetails') === null || localStorage.getItem('memberDetails') === '{}' || localStorage.getItem('memberDetails') === undefined)
        {
            $rootScope.popupButtonGroup = 'EnterMemDetails';            
            $rootScope.goEft = true;        //setting this flag so that after filling members details user is redirected to EFT
            $rootScope.goClaim = false;            
            $rootScope.showHideMessageActionPopup('ENTER MEMBERSHIP DETAILS','Please enter your member details.', true);
        }
        else {
            if (localStorage.getItem('eftFlag') == 'false') {
                $location.path('/eft');
            }
            else if (localStorage.getItem('bankDetailsFlag') === 'true') {
                localStorage.setItem('bankDetailsFlag', false);
                $location.path('/eft');
            }
            else {
                $('#menu').trigger('close.mm');                
                $rootScope.popupButtonGroup = 'submitClaimConfirm';                
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
    };


    $scope.submitClaims = function() {
        var currentClaim = [];
        var tempEftDeatails = '';
        //fetching eftDEtails
        if (localStorage.getItem('eftDetails'))
            utilsService.decrypt(localStorage.getItem('eftDetails'), function(err, res) {
                console.log(res);
                tempEftDeatails = JSON.parse(res);
            });

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
                var memDetailsJson = '';
                var eftJson = '';
                var claimJson = '';
                //fetching member details.
                utilsService.decrypt(localStorage.getItem('memberDetails'), function(err, res) {
                    console.log(res);
                    memDetailsJson = JSON.parse(res);
                    memDetailsJson['phoneNo'] = $rootScope.mobileNo;
                });

                var finalJson = {
                    'eft': '',
                    'memberDetails': memDetailsJson,
                    'receipts': currentClaim
                }


                console.log(finalJson);

                $('.masking').show();
                //service layer call to send data to cloud
                submitClaimService.submitClaim(finalJson, function(err, res) {
                    if (res) {
                        utilsService.encrypt(JSON.stringify(claimListArray), function(err, res) {
                            localStorage.setItem('claimList', res);
                        });
                        $('.masking').hide();
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
                        $('.masking').hide();
                        $rootScope.infoHeader = 'ERROR';
                        $('.infoText').html(err);
                        $('.blackMasking').show();
                        $rootScope.infoFlag = true;
                        $scope.$apply();
                    }
                });
            }
        } else {
            var claimListArray = $scope.claimListVal;
            if ($rootScope.receiptList.length !== 0) {
                for (var k = 0; k < $rootScope.receiptList.length; k++) {
                    $rootScope.receiptList[k].treatmentDate = new Date();
                    currentClaim.push($rootScope.receiptList[k]);
                    claimListArray.push($rootScope.receiptList[k]);
                }
                var memDetailsJson = '';
                var eftJson = '';
                var claimJson = '';
                //fetching member details.
                utilsService.decrypt(localStorage.getItem('memberDetails'), function(err, res) {
                    console.log(res);
                    memDetailsJson = JSON.parse(res);
                    memDetailsJson['phoneNo'] = $rootScope.mobileNo;
                });


                var finalJson = {
                    'eft': '',
                    'memberDetails': memDetailsJson,
                    'receipts': currentClaim
                }

                console.log(finalJson);
                $('.masking').show();
                //service layer call to send data to cloud
                submitClaimService.submitClaim(finalJson, function(err, res) {
                    if (res) {
                        $('.masking').hide();                        

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
                        $('.masking').hide();
                        $rootScope.infoHeader = 'ERROR';
                        $('.infoText').html(err);
                        $('.blackMasking').show();
                        $rootScope.infoFlag = true;
                        $scope.$apply();
                    }
                });
            }
        }

    }



    /**
     * addAnotherReceipt
     *
     * Function to call new receipt function after hiding claimReceiptList
     * 
     */
    $scope.addAnotherReceipt = function() {
        $("input").blur();
        var errorStatus = false;
        for (var i = 1; i <= $rootScope.receiptVal.length; i++) {
            if (parseFloat($('#receiptIndex' + i + ' .changePinTxt').val()) === 0) {
                $rootScope.infoHeader = 'ERROR';
                $('.infoText').html($rootScope.invalidNumberMessage);
                $('.blackMasking').show();
                $rootScope.infoFlag = true;
                errorStatus = true;
                return false;               //returning false if any fields is blank
            }
            if (!$('#receiptIndex' + i + ' .changePinTxt').val() || !$('#receiptIndex' + i + ' #treatmentTypeListTxt' + i).val()) {
                $rootScope.infoHeader = 'ERROR';
                $('.infoText').html($rootScope.emptyFieldMessage);
                $('.blackMasking').show();
                $rootScope.infoFlag = true;
                errorStatus = true;
                return false;               //returning false if any fields is blank
            }
        }
        ;
        if (errorStatus === false)
        {
            $scope.summaryFlag = false;
            $rootScope.showSummaryBtn = true;
            $('.claimReceiptList').hide();
            $scope.newReceipt();
        }
    };

    /**
     * updateBankDetails
     *
     * Function to navigate to bank details screen and update details from there
     * 
     */
    $("#updateBankDetails").on('click', function() {
        localStorage.setItem('bankDetailsFlag', true);
        $scope.showEft();
        $scope.$apply();
        $rootScope.popupButtonGroup = null;
        // $('.blackMasking').hide();
        // $('.popup-header').html('');
        // $('.body-text').html('');
        // $('.popup').hide();
        $rootScope.showHideMessageActionPopup('','', false);
    });

    $scope.showAmendBankDetailsWarning = function() {
        $("input").blur();
        $rootScope.popupButtonGroup = 'amendBankDetails';        
        $rootScope.showHideMessageActionPopup('Warning','Please note: Only changes made to bank details by the main member will be accepted and will result in the change(s) being applied to all subsequent claims for this policy.', true);        
    };


    /**
     * newReceipt
     *
     * Function to add new receipt.
     * 
     */
    $scope.newReceipt = function() {
        $('#preview').hide();
        $('#captureImg').hide();
        $('#receiptAmout').hide();
        $('#datePickerDiv').hide();
        $('#treatmentDiv').hide();
        $('#camIconTxt').hide();
        $('#cashIconTxt').hide();
        $('#treatmentTxt').hide();
        $('.claimDwnArrow').hide();

        $('#treatmentIcon').attr('src', 'images/treatment_grey.png');
        $('#cashIcon').attr('src', 'images/cash_grey.png');
        $('#camIcon').attr('src', 'images/photo_pink.png');
        $('#receiptIcon').attr('src', 'images/treatment_grey.png');

        $('#span1').text('Upload a ');
        $('#span2').html('photo ');
        $('#span3').text('of your receipt');

        $scope.claimAmount = '';
        $scope.treatmentType = '';
        var len = $rootScope.receiptVal.length;
        $scope.claimInit();
        historyService.push({
            "parent": "submitClaim",
            "backAction": function() {
                $scope.gotoSummary();
                var list = $rootScope.receiptVal;
                if (list.length >= 1) {
                    $rootScope.receipt = $rootScope.receiptVal[len - 1];
                } else if (list.length > 0) {
                    $rootScope.receipt = list[list.length - 1];
                } else {
                    $location.hash = "/home";
                }
            }
        })

    };

    /**
     * currentDate
     *
     * Function to return current date in dd mmm yyyy format.
     * 
     */
    $scope.currentDate = function() {
        var d = new Date();
        var monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        return d.getDate() + ' ' + monthArr[d.getMonth()] + ' ' + d.getFullYear();
    };

    /**
     * showImagePage
     *
     * Function to navigate back to select image screen if already selected.
     * 
     */
    $scope.showImagePage = function() {
        if (!$scope.summaryFlag) {
            if ($('#camIcon').attr('src') === 'images/photo_blue.png')
            {
                $('#preview').hide();
                $('#uploadPhoto').show();
                $('#receiptAmout').hide();
                $('#treatmentDiv').hide();
                $('.claimDwnArrow').hide();
                $('.claimReceiptList').hide();
                $('#claimDwnArrow').hide();
                $('#camIconArrow').show();
                $('#captureImg').show();                
                $('#span1').text('Upload a ');
                $('#span2').html('photo ');
                $('#span3').text('of your receipt');
                $('#preview').show();
                $('#uploadPhoto').hide();
            }
        }
    };

    /**
     * showCashPage
     *
     * Function to navigate back to receipt amout screen if already selected.
     * 
     */
    $scope.showCashPage = function() {
        if (!$scope.summaryFlag) {
            if ($('#cashIcon').attr('src') === 'images/cash_blue.png' || $('#cashIcon').attr('src') === 'images/cash_pink.png') {
                $('#preview').hide();
                $('#receiptAmout').hide();
                $('#treatmentDiv').hide();
                $('.claimDwnArrow').hide();
                $('#claimDwnArrow').hide();
                $('.claimReceiptList').hide();
                $('#camIconArrow').show();
                $('#captureImg').show();
                $scope.showReceiptAmt();
                if ($('#cashIcon').attr('src') === 'images/cash_pink.png')
                    $('#cashIcon').attr('src', 'images/cash_pink.png');
                else
                    $('#cashIcon').attr('src', 'images/cash_blue.png');
            }
        }
    }

    /**
     * showImagePage
     *
     * Function to navigate back to treatment type screen if already selected.
     * 
     */
    $scope.showTreatmentPage = function() {        
        if (!$scope.summaryFlag) {
            if ($('#treatmentIcon').attr('src') === 'images/treatment_blue.png' || $('#treatmentIcon').attr('src') === 'images/treatment_pink.png') {
                $('#preview').hide();
                $('#receiptAmout').show();
                $('#treatmentDiv').hide();
                $('.claimDwnArrow').hide();
                $('#claimDwnArrow').hide();
                $('#camIconArrow').hide();
                $('#cashIconArrow').show();
                $('#captureImg').hide();
                $scope.showTreatmentDiv();
                if ($scope.summaryFlag)
                    $('#treatmentIcon').attr('src', 'images/treatment_blue.png');
                $('.claimReceiptList').hide();
            }
        }
    };


    $scope.keydown = function($event) {

        if ($event.keyCode === 9) {
            var tar = $($event.target);
            if (tar.attr("id") === "receiptAmt") {
                this.showTreatmentDiv();
            } else if (tar.attr("id") === "treatmentTextArea") {
                this.showReceiptSummary();
            }
        } else if ($event.keyCode === 13) {
            var tar = $($event.target);
            if (tar.attr("id") === "receiptAmt") {
                $scope.showTreatmentDiv();
                $scope.$apply();
            }
        }
    }

});

