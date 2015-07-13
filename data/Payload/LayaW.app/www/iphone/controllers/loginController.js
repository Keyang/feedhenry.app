layaApp.controller('loginController', function($scope, $location, $rootScope, authenticationService, changePinService, secreteKeyService, Idle) {


    'use strict';
    /**
     * loginInit
     *
     * Initialize things on loding of login screen
     * 
     */
    $scope.loginInit = function() {
        $('.homeHeader').hide();
        $('.homeImg').hide();
        /* 
        $('.loginContainer').css('height', $(window).height() + 'px');
        $('.container').css('height', $(window).height() + 'px');
        $('body').css('height',$(window).height() + 'px');
        alert('window : ' + $(window).height());*/

        $('.container').css('height',$(document).height()+ 'px');
        $('.container').css('min-height',415+'px');
        $('.loginContainer').css('height', $('.container').height());        

        var tempHeight = $(window).height() - ($('.laya-logo').height() + $('.login-credentials-container').height() + $('.forgotten-pin').height() + 34 + 17);
        var copyRightHeight = (tempHeight / 2) - (30);
        if (copyRightHeight > 0) {
            $('.trademark').css('margin-top', copyRightHeight + 'px');
        }   
        $('.masking').css('height', $(document).height() + 'px');         

        $(window).resize(function() {
            $('.container').css('height',$(document).height()+ 'px');
            $('.container').css('min-height',415+'px');
            $('.loginContainer').css('height', $('.container').height());
            var tempHeight = $(window).height() - ($('.laya-logo').height() + $('.login-credentials-container').height() + $('.forgotten-pin').height() + 34 + 17);
            var copyRightHeight = tempHeight / 2 - 25;
            if (copyRightHeight > 0)
                $('.trademark').css('margin-top', copyRightHeight + 'px');
            $('.masking').css('height', $(window).height() + 'px');
        });

        //creating ng-model for login screen
        $rootScope.credentials = {
        };
        
        //logic to set copyright year
        $rootScope.copyrightYear = new Date().getFullYear();        
    };
    /**
     * loadHomeScreen
     *
     * Redirect to home screen.
     * 
     */
    $scope.loadHomeScreen = function() {
        $location.path('/home');
    };
    /**
     * loadLogin
     *
     * Load login screen and set flag to show button 
     * respective to login screen
     * 
     */
    $scope.loadLogin = function() {
        $rootScope.credentials = {};
        if ($rootScope.loginFlag !== 'confirmPin') {
            $rootScope.loginRes = undefined;
        }
        $('.forgotten-pin').show();
        $rootScope.loginFlag = 'login';
        $rootScope.secondCredentialsFlag = 'pin';
        $rootScope.firstcredentialsFlag = 'mobileNo';
    };

    $scope.showPopup = function(header, message) {
        $rootScope.infoHeader = header;
        $('.infoText').html(message);
        $('.blackMasking').show();
        $rootScope.infoFlag = true;
    };

    /**
     * validateLoginCredentials
     *
     * Validate login credential i.e mobile number and pin number
     * 
     */
    $scope.validateLoginCredentials = function()
    {        
        $("input").blur();
        // Check if user is offline
        if ($rootScope.connection == 'offline') {            
            $scope.showPopup("ERROR", 'Connection lost please connect to network and try again.');
        } else {
            // Just came online and don't have the secret key
            if (!$rootScope.secKey) {                
                $scope.showPopup("ERROR", 'Please check your connection and try again.');
                $rootScope.getToken(function(res){
                    if (res) {
                        // $scope.validateUser();
                    }                    
                });
            }else {
                $scope.validateUser();
            }
        }
    };

    $scope.validateUser = function() {        
        if (!$rootScope.credentials.mobileNo || $rootScope.credentials.mobileNo.length < 10) {            
            $scope.showPopup("ERROR", 'Please enter valid mobile number.');
        } else if (!$rootScope.credentials.pin || $rootScope.credentials.pin.length < 4) {            
            $scope.showPopup("ERROR", 'Please enter a 4 digit Pin.');
        } else {
            //logic to check between current login and previous login 
            if ($rootScope.connection == "offline") {                
                $scope.showPopup("ERROR", 'Connection lost please connect to network and try again..');    
            } else {
                $scope.authenticateUser();
            }
        }
    };    

    $scope.authenticateUser = function() {
        var loginData = {
            "mobileNo": $rootScope.credentials.mobileNo,
            "pinNo": $rootScope.credentials.pin
        };
        $('.masking').show();
        authenticationService.login(loginData, function(err, res) {
            $('.masking').hide();
            if (res) {                
                $rootScope.loginRes = res;
                if (res.status && res.status == 'Inactive') {
                    $rootScope.memberNo = res.memberNo;
                    $rootScope.mobileNo = res.mobileNo;
                    $scope.gotoConfirmPinPage();
                    return;
                };
                Idle.watch();
                if (localStorage.getItem('cloudMemberNo') === null || localStorage.getItem('cloudMemberNo') === undefined) {
                    localStorage.setItem('cloudMemberNo', res.memberNo);
                }
                if (localStorage.getItem('cloudMobileNo') === null || localStorage.getItem('cloudMobileNo') === undefined) {
                    localStorage.setItem('cloudMobileNo', res.mobileNo);
                    $rootScope.memberNo = res.memberNo;
                    $('.masking').hide();
                    $rootScope.mobileNo = $rootScope.credentials.mobileNo;                    
                    $scope.loadHomeScreen();
                    $scope.$apply();                    
                } else if (localStorage.getItem('cloudMobileNo') !== res.mobileNo || localStorage.getItem('cloudMemberNo') !== res.memberNo) {
                    $rootScope.popupButtonGroup = 'userExistsMsg';
                    $scope.$apply();                    
                    $rootScope.showHideMessageActionPopup('WARNING','Another user has already registered on this device.</br>All previous claims and details will be lost.</br>Do you want to continue?', true);
                } else {
                    $rootScope.memberNo = res.memberNo;
                    $('.masking').hide();
                    $rootScope.mobileNo = $rootScope.credentials.mobileNo;
                    //$rootScope.clearLocalstorage = false;
                    $scope.loadHomeScreen();
                    $scope.$apply();
                }
            } else {
                // $rootScope.clearLocalstorage = false;
                $('.masking').hide();
                $rootScope.infoHeader = 'ERROR';
                $('.infoText').html(err);
                $('.blackMasking').show();
                $rootScope.infoFlag = true;
                $scope.$apply();
            }
        });
    }

    $scope.gotoConfirmPinPage = function() {
        $('.masking').hide();        
        $rootScope.popupButtonGroup = 'registration';
        $scope.$apply();
        $rootScope.showHideMessageActionPopup('REGISTRATION CODE','You have been sent a unique pin code by SMS.</br>Please enter the code below.', true);
        $('.code-input').show();        
    }

    /**
     * Clear Local storage
     */
    $scope.clearLocalStorage = function() {
        localStorage.removeItem('memberDetails');
        // localStorage.removeItem('eftFlag');
        localStorage.setItem('eftFlag', false);
        localStorage.removeItem('claimList');
        localStorage.removeItem('bankDetailsFlag');
        $('.homeImgTxt').html("Welcome");
        $('.sideMenuUpperTxt').html("Welcome");
        localStorage.setItem('cloudMobileNo', $rootScope.loginRes.mobileNo);
        localStorage.setItem('cloudMemberNo', $rootScope.loginRes.memberNo);
        $('.masking').hide();
        $rootScope.memberNo = $rootScope.loginRes.memberNo;
        $rootScope.mobileNo = $rootScope.credentials.mobileNo;
        $scope.loadHomeScreen();
        $scope.hidePopUp();
    };
    /**
     * loadSignUp
     *
     * Load sign up screen and set flag to show button 
     * respective to sign up screen
     * 
     */
    $scope.loadSignUp = function() {
        $rootScope.credentials.validatePin = null;
        $rootScope.credentials = {};        
        $rootScope.loginFlag = 'signUp';
        $('.forgotten-pin').hide();
        $rootScope.secondCredentialsFlag = 'memberNo';
    };
    /**
     * validateSignUpCredentials
     *
     * Validate sign up credential i.e mobile number and member number
     * 
     */
    $scope.validateSignUpCredentials = function() {
        $("input").blur();
        if ($rootScope.connection == 'offline')
        {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Connection lost please connect to network and try again.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else {
            // Just came online and don't have the secret key
            if (!$rootScope.secKey) {
                $rootScope.getToken(function(res){
                    if (res) {
                        $scope.signUpUser();
                    }
                    else //added to fix sign up
                    {
                        $rootScope.infoHeader = 'ERROR';
                        $('.infoText').html('Request timeout, please try again.');
                        $('.blackMasking').show();
                        $rootScope.infoFlag = true;
                    }
                });
            }else {
                $scope.signUpUser();
            }
        }        
    };

    $scope.signUpUser = function() {
//        if (!$rootScope.credentials.mobileNo || $rootScope.credentials.mobileNo.length < 10)
        if (!$rootScope.credentials.mobileNo || $rootScope.credentials.mobileNo.length !== 10)
        {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Please enter valid Mobile Number.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else if (!$rootScope.credentials.memberNo || $rootScope.credentials.memberNo.length < 10)
        {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Please enter the 10 digit Membership Number.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else
        {
            $('.masking').show();
            var signUpData = {
                "mobileNo": $rootScope.credentials.mobileNo,
                "memberNo": $rootScope.credentials.memberNo
            };
            $rootScope.mobileNo = $rootScope.credentials.mobileNo;
            $rootScope.memberNo = $rootScope.credentials.memberNo;
            $rootScope.credentials = {};
            authenticationService.signUp(signUpData, function(err, res) {
                if (res)
                {
                    $('.masking').hide();                    
                    $rootScope.popupButtonGroup = 'registration';
                    $scope.$apply();
                    $rootScope.showHideMessageActionPopup('REGISTRATION CODE','You have been sent a unique pin code by SMS.</br>Please enter the code below.', true);
                    $('.code-input').show();                    
                } else {
                    $('.masking').hide();
                    $rootScope.infoHeader = 'ERROR';
                    $('.infoText').html(err);
                    $('.blackMasking').show();
                    $rootScope.infoFlag = true;
                    $scope.$apply();
                }
            });
        }
    };

    $scope.loadForgotPin = function()
    {
        $rootScope.credentials = {};
        // $rootScope.credentials.mobileNo = "+353";
        $('.forgotten-pin').hide();
        $rootScope.loginFlag = 'forgotPin';
        $rootScope.secondCredentialsFlag = 'memberNo';
    };
    /**
     * validateForgotPinCredentials
     *
     * Validate forgot pin credential i.e mobile number and member number
     * 
     */
    $scope.validateForgotPinCredentials = function()
    {
        $("input").blur();
        if ($rootScope.connection == 'offline')
        {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Connection lost please connect to network and try again.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else {
            // Just came online and don't have the secret key
            if (!$rootScope.secKey) {
                $rootScope.getToken(function(res){
                    if (res) {
                        $scope.validateUserForgotPin();
                    }
                    else //added to fix forgot pin
                    {
                        $rootScope.infoHeader = 'ERROR';
                        $('.infoText').html('Request timeout, please try again.');
                        $('.blackMasking').show();
                        $rootScope.infoFlag = true;
                    }
                });
            }else {
                $scope.validateUserForgotPin();
            }
        }        
    };

    $scope.validateUserForgotPin = function() {
        if (!$rootScope.credentials.mobileNo || $rootScope.credentials.mobileNo.length !== 10)
        {
//        if (!$rootScope.credentials.mobileNo || $rootScope.credentials.mobileNo.length < 10)
//        {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Please enter valid Mobile Number.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else if (!$rootScope.credentials.memberNo)
        {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Please enter Membership Number.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else {
            var forgotPinData = {
                "mobileNo": $rootScope.credentials.mobileNo,
                "memberNo": $rootScope.credentials.memberNo
            };
            $rootScope.mobileNo = $rootScope.credentials.mobileNo;
            $rootScope.credentials = {};
            $('.masking').show();
            secreteKeyService.forgotPin(forgotPinData, function(err, res) {
                if (res)
                {
                    $('.masking').hide();
                    $scope.forgotPinFlow = true;
                    $rootScope.popupButtonGroup = 'forgotPin';
                    $rootScope.$apply();
                    $rootScope.showHideMessageActionPopup('CHANGE PIN','You have been sent a unique pin code by SMS.</br>Please enter the code below.', true);
                    $('.code-input').show();                    
                }
                else {
                    // $rootScope.credentials.mobileNo = "+353";
                    $('.masking').hide();
                    $rootScope.infoHeader = 'ERROR';
                    $('.infoText').html(err);
                    // $('.secondLayerBlackMasking').show();
                    $rootScope.infoFlag = true;                    
                    $scope.$apply();
                }
            });
        }
    };

    $scope.confirmPin = function() {

        if ($rootScope.credentials.validatePin === undefined || $rootScope.credentials.validatePin === "" || $rootScope.credentials.validatePin === null) {
            $rootScope.credentials.validatePin = null;
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html("Please enter a valid 4 digit pin number.");
            $rootScope.infoFlag = true;
            $scope.$apply();
            $('.code-input').show();
            return;
        };

        var confirmPinData = {
            "mobileNo": $rootScope.mobileNo,
            "memberNo": $rootScope.memberNo,
            "pinNo": $rootScope.credentials.validatePin
        };
        $('.masking').show();
        authenticationService.confirmPin(confirmPinData, function(err, res) {            
            if (res)
            {
                $('.masking').hide();
                $('.code-input').hide();
                $rootScope.validatePin = $rootScope.credentials.validatePin;
                $rootScope.credentials.validatePin = null;
                $rootScope.loginFlag = 'confirmPin';
                $rootScope.firstcredentialsFlag = 'enterNewPin';
                $rootScope.secondCredentialsFlag = 'confirmPin';
                $scope.$apply();                
                $rootScope.showHideMessageActionPopup('','', false);
            }
            else {
                $('.masking').hide();                
                $rootScope.credentials.validatePin = null;
                $rootScope.infoHeader = 'ERROR';
                $('.infoText').html(err);
                // $('.secondLayerBlackMasking').show();
                $rootScope.infoFlag = true;                
                $scope.$apply();
                $('.code-input').show();
            }
        });
    };
    /**
     * validateChangePinCredentials
     *
     * Validate change pin credential i.e new pin and confirm pin
     * 
     */
    $scope.validateChangePinCredentials = function() {
        $("input").blur();
        if (!$rootScope.credentials.newPin || $rootScope.credentials.newPin.length < 4)
        {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Please enter new 4 digit Pin.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else if (!$rootScope.credentials.confirmPin)
        {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('Please confirm Pin.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else if ($rootScope.credentials.newPin !== $rootScope.credentials.confirmPin)
        {
            $rootScope.infoHeader = 'ERROR';
            $('.infoText').html('New Pin and Confirm Pin do not match.');
            $('.blackMasking').show();
            $rootScope.infoFlag = true;
        }
        else {
            $('.masking').show();
            var data = {
                "current": $rootScope.validatePin,
                "new": $rootScope.credentials.newPin
            };
            changePinService.changePin(data, function(err, res) {
                if (res)
                {
                    Idle.watch();                    
                    $('.masking').hide();
                    if ($rootScope.loginRes && $rootScope.loginRes.status === 'Inactive') {
                        if (localStorage.getItem('cloudMobileNo') !== $rootScope.loginRes.mobileNo || localStorage.getItem('cloudMemberNo') !== $rootScope.loginRes.memberNo) {
                            $rootScope.popupButtonGroup = 'userExistsMsg';
                            $scope.$apply();                    
                            $rootScope.showHideMessageActionPopup('WARNING','Another user has already registered on this device.</br>All previous claims and details will be lost.</br>Do you want to continue?', true);
                            $scope.loadLogin();
                        }else {
                            $scope.loadHomeScreen();
                        }
                    }else {
                        $rootScope.infoHeader = 'SUCCESS';
                        $rootScope.$apply();
                        $('.infoText').html('Pin changed successfully.');
                        $rootScope.infoFlag = true;
                        $rootScope.$apply();
                        $scope.loadLogin();
                    }                    
                    $('.blackMasking').show();
                }
                else
                {
                    $('.masking').hide();
                    $rootScope.infoHeader = 'ERROR';
                    $('.infoText').html(err);
                    $('.blackMasking').show();
                    $rootScope.infoFlag = true;
                    $scope.$apply();
                }
            });
        }
    };

    /**
     * This function return dail code like +1
     */
    $scope.getDailCode = function()
    {
        return "+353";
    }
    /**
     * hidePopUp
     *
     * This function will hide black masking and pop up
     * 
     */
    $scope.hidePopUp = function()
    {
        // $('.blackMasking').hide();
        $('.masking').hide();
        // $('.popup').hide();
        $rootScope.showHideMessageActionPopup('','', false);
    };

    /**
     * hideInfoPopUp
     *
     * This function will hide black masking and info popup 
     * This pop up used to display error/success/warning/any message with only ok button
     * 
     */
    $scope.hideInfoPopUp = function() {
        $(".infoText").removeClass("bankDetailsInfoPopup");
        $rootScope.infoFlag = false;
        /*if ($('.secondLayerBlackMasking').css('display') === "block")
        {
            $('.secondLayerBlackMasking').hide();
        }
        else {
            $('.blackMasking').hide();
            $('.code-input').hide();
        }*/
        if ($rootScope.goEft && $('#conditionCheckbox').attr('checked'))
        {
            $rootScope.goEft = false;
            $location.path('/eft');
        }
        else if ($rootScope.goClaim && $('#conditionCheckbox').attr('checked'))
        {
            $rootScope.goClaim = false;
            $location.path('/submitClaim');
        }
        $rootScope.inputElementFlag = false;
    };

    $scope.confirmDel = function() {
        setTimeout(function() {
            $('#confirmDelBtn').click();
        }, 100);
    };
    $scope.confirmGallery = function() {
        setTimeout(function() {
            $('#galleryBtn').click();
        }, 100);
    };
    $scope.confirmCamera = function() {
        setTimeout(function() {
            $('#cameraBtn').click();
        }, 100);
    };
    $scope.confirmMemberDetails = function() {
        $('#menu').trigger('close.mm');
        // $('.popup').hide();
        // $('.blackMasking').hide();
        $rootScope.showHideMessageActionPopup('','', false);
        $location.path('/memberDetails');
    };

    $scope.amendBnakDetails = function() {
        setTimeout(function() {
            $('#updateBankDetails').click();
        }, 100);
    };

    $scope.cancelClaimConfirm = function() {
        setTimeout(function() {
            $('#menu').trigger('close.mm');            
            $rootScope.showHideMessageActionPopup('','', false);
            if (($location.path() === "/eft" || $location.path() === "/memberDetails") && $rootScope.receiptVal.length > 0) {
                if($rootScope.setUrl === '/') {
                    $scope.loadLogin();
                }
                $location.path($rootScope.setUrl);
                $rootScope.receiptVal = [];
                $scope.$apply();
            } else {
                $('#cancelClaimBtn').click();
            }                
        }, 100);
    };
    $scope.eftConfirm = function() {
        $('#menu').trigger('close.mm');        
        $rootScope.showHideMessageActionPopup('','', false);
        $('.masking').show();
        setTimeout(function() {
            $('#submitClaim').click();
        }, 100);
    };

    $scope.submitClaimConfirm = function() {
        $('#menu').trigger('close.mm');        
        $rootScope.showHideMessageActionPopup('','', false);
        $('.masking').show();
        setTimeout(function() {
            $('#claimSubmit').click();
        }, 100);
    };

    $scope.confirmCamAction = function() {
        setTimeout(function() {
            $('#cameraActionBtn').click();
        }, 100);
    };

    /**************************** Check Idle Condition ***************************/

    $scope.$on('IdleStart', function() {
        // the user appears to have gone idle
        console.log('IdleStart');
    });
    $scope.$on('IdleWarn', function(e, countdown) {
        // follows after the IdleStart event, but includes a countdown until the user is considered timed out
        // the countdown arg is the number of seconds remaining until then.
        // you can change the title or display a warning dialog from here.
        // you can let them resume their session by calling Idle.watch()
        console.log('IdleWarn');
    });
    $scope.$on('IdleTimeout', function() {
        // the user has timed out (meaning idleDuration + timeout has passed without any activity)
        // this is where you'd log them
        console.log('IdleTimeout');
        $location.path('/');
        $scope.loadLogin();
        $(".masking").hide();
        $('.secondLayerBlackMasking').hide();
        $('.terms-popup').hide();
        $rootScope.showHideMessageActionPopup('', '', false);        
        $rootScope.$apply(function() {
            $rootScope.infoFlag = false;            
        });        
    });
    $scope.$on('IdleEnd', function() {
        // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
        console.log('IdleEnd');
    });
    $scope.$on('Keepalive', function() {
        // do something to keep the user's session alive
        console.log('KeepAlive');
    });

    /**************************** Check Idle Condition ***************************/
})
.config(function(IdleProvider, KeepaliveProvider) {
    // configure Idle settings
    IdleProvider.idle(5); // in seconds
    IdleProvider.timeout(600); // in seconds
    KeepaliveProvider.interval(2); // in seconds
})
.run(function(Idle) {
    // start watching when the app runs. also starts the Keepalive service by default.
    Idle.watch();
});
