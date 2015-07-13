layaApp.controller('indexController', function($scope, $location, $rootScope, secreteKeyService, utilsService, historyService) {

  //initialisation function for setting header
  'use strict';
  $scope.indexInit = function() {
    $('#menu').mmenu();
    $rootScope.receiptVal = []; // receipt array containing all the receipts for a claim  (used mainly under 'submitClaimController') 
    $rootScope.receiptList = [];

    $rootScope.inputElementFlag = false;
    $rootScope.restrictBackFlow = false;
    $rootScope.messageActionFlag = false; // Popup flag

    $rootScope.windowHeight = $(window).height();
    $rootScope.containerHeight = $('.container').height();

    setTimeout(function() {
      var topHeight = ($rootScope.windowHeight / 2) / 2;
      var tempHeight = ($(window).height() - $('.errorPopup').height()) * 0.42;
      $('.infoPopup').css('margin-top', topHeight + 'px');
      if (null !== localStorage.getItem('memberDetails') && undefined !== localStorage.getItem('memberDetails') && '{}' !== localStorage.getItem('memberDetails')) {
        var memberDetails = '';
        utilsService.decrypt(localStorage.getItem('memberDetails'), function(err, res) {
          memberDetails = JSON.parse(res);
          $('.homeImgTxt').html(memberDetails.firstName);
          $('.sideMenuUpperTxt').html(memberDetails.firstName);
        });
      }
    }, 100);

    $("#aboutAction").on('click', function() {
      $('#menu').trigger('close.mm');
      if ($location.path() === "/submitClaim" && $("#uploadPhoto").css('display') === 'none' || $("#captureImg").css('display') === 'none' || $rootScope.receiptVal.length > 0) {
        $rootScope.popupButtonGroup = 'cancelClaim';
        $rootScope.$apply();
        $rootScope.showHideMessageActionPopup('WARNING', 'Current claim information will be discarded if you continue. Click Cancel to return to claim in progress.', true);
        $rootScope.$apply();
        $('.message-action-popup').css('height', $(window).height());
        $rootScope.setUrl = '/about';
      } else {
        $location.path('/about');
        $scope.$apply();
      }
    });

    $("#eftAction").on('click', function() {
      $('#menu').trigger('close.mm');
      if ($location.path() === "/submitClaim" && $("#uploadPhoto").css('display') === 'none' || $("#captureImg").css('display') === 'none' || $rootScope.receiptVal.length > 0) {
        $rootScope.popupButtonGroup = 'cancelClaim';
        $scope.$apply();
        $rootScope.showHideMessageActionPopup('WARNING', 'Current claim information will be discarded if you continue. Click Cancel to return to claim in progress.', true);
        $rootScope.$apply();
        $('.message-action-popup').css('height', $(window).height());
        $rootScope.$apply();
        $rootScope.restrictBackFlow = false;
        historyService.push({
          "parent": "home",
          "path": "/eft",
          "backAction": function() {
            $("#eftAction").click(); //yes it is dirty.
          }
        });
        $rootScope.setUrl = '/home';
      } else {
        $location.path('/eft');
        $scope.$apply();
      }
    });

    $("#memberDetailsAction").on('click', function() {
      $('#menu').trigger('close.mm');
      if ($location.path() === "/submitClaim" && $("#uploadPhoto").css('display') === 'none' || $("#captureImg").css('display') === 'none' || $rootScope.receiptVal.length > 0) {
        $rootScope.popupButtonGroup = 'cancelClaim';
        $scope.$apply();
        $rootScope.showHideMessageActionPopup('WARNING', 'Current claim information will be discarded if you continue. Click Cancel to return to claim in progress.', true);
        $rootScope.$apply();
        $('.message-action-popup').css('height', $(window).height());
        $rootScope.setUrl = '/memberDetails';
      } else {
        $location.path('/memberDetails');
        $scope.$apply();
      }
    });

    $("#homeAction").on('click', function() {
      $('#menu').trigger('close.mm');
      if ($location.path() === "/submitClaim" && $("#uploadPhoto").css('display') === 'none' || $("#captureImg").css('display') === 'none' || $rootScope.receiptVal.length > 0) {
        $rootScope.popupButtonGroup = 'cancelClaim';
        $scope.$apply();
        $rootScope.showHideMessageActionPopup('WARNING', 'Current claim information will be discarded if you continue. Click Cancel to return to claim in progress.', true);
        $rootScope.$apply();
        $('.message-action-popup').css('height', $(window).height());
        $rootScope.$apply();
        $rootScope.restrictBackFlow = false;
        historyService.push({
          "parent": "home",
          "path": "/submitClaim",
          "backAction": function() {
            $("#homeAction").click(); //yes it is dirty.
          }
        });
        $rootScope.setUrl = '/home';
      } else {
        $location.path('/home');
        $scope.$apply();
      }
    });

    $("#reviewClaimAction").on('click', function() {
      $('#menu').trigger('close.mm');
      if ($location.path() === "/submitClaim" && $("#uploadPhoto").css('display') === 'none' || $("#captureImg").css('display') === 'none' || $rootScope.receiptVal.length > 0) {
        $rootScope.popupButtonGroup = 'cancelClaim';
        $scope.$apply();
        $rootScope.showHideMessageActionPopup('WARNING', 'Current claim information will be discarded if you continue. Click Cancel to return to claim in progress.', true);
        $rootScope.$apply();
        $('.message-action-popup').css('height', $(window).height());
        $rootScope.setUrl = '/reviewClaims';
      } else {
        $location.path('/reviewClaims');
        $scope.$apply();
      }
    });

    $("#changePinAction").on('click', function() {
      $scope.changePin();
      $scope.$apply();
    });

    $("#submitClaimAction").on('click', function() {
      $scope.submitClaim();
      $scope.$apply();
    });

    $("#contactUsAction").on('click', function() {
      $scope.contactUs();
      $scope.$apply();
    });

    $("#logoutAction").on('click', function() {
      $scope.logout();
      $scope.$apply();
    });

    // Event Listeners 
    document.addEventListener("deviceready", onDeviceReady, false);    
    // document.addEventListener("touchstart", onTouchMove, false);

    $(document).ready(function(){
      var flag = false;
      $('#empty-div').bind('touchstart', function(){
        $('#menu').trigger('close.mm'); //fix to close menubar
      });
      $('#empty-div').bind('touchmove', function(e){
        e.preventDefault();
      });

      $(document).bind('touchstart', function(e){
        if ($('.message-action-popup').is(':visible') || $('.message-popup').is(':visible')) {
          $('.container').css('overflow-y', 'hidden');
        }else {
          $('.container').css('overflow-y', 'auto');
        }
      });
    });

    /*
     *  Restrict iOS Bounce Effect
     */

    /*var container = document.getElementById("parentContainer");
    var ts;
    var direction = "";*/

    /*function onTouchMove(evt) {
      if ($rootScope.platform != "Android") {
        if ($('.termsPopup').is(':visible')) {
          return;
        };
        evt.preventDefault(); // Disable scroll 
      }
    };*/

    /*$('#parentContainer').bind('touchstart', function(e) {
      ts = e.originalEvent.touches[0].clientY; // Get touch start y point            
    });*/

    /*$('#parentContainer').bind('touchmove', function(e) {
      if ($rootScope.platform != "Android") {
        // Scroll End 
        var scrollHeight = $("#container").prop('scrollHeight');
        var divHeight = $("#container").height();
        var scrollerEndPoint = scrollHeight - divHeight;
        var te = e.originalEvent.changedTouches[0].clientY;
        var divScrollerTop = $("#container").scrollTop();
        var offset;
        if ((divScrollerTop === scrollerEndPoint) && (ts > te)) {
          // Your Code 
          // The Div scroller has reached the bottom                  
          return;
        }

        // if ($('.claimTopBarOuter').length) {
        //     offset = $('.claimTopBarOuter').offset();     // Get attributes of top bar
        if ($('.claimReceiptList').length) {
          offset = $('.claimReceiptList').offset(); // Get attributes of top bar
        } else if ($('.aboutLayaLogo').length) {
          offset = $('.aboutLayaLogo').offset(); // Get attributes of top about logo
        } else if ($('.homeImg').length) {
          offset = $('.homeImg').offset(); // Get attributes of top home image
        }

        var w = $('.container'); // Get container element to access
        var scrollOffset = offset.top - w.scrollTop(); // Get y position            

        // Check to see if the move is towards up / down. Based on movement 
        // restrict / allow User to scroll.
        if ((scrollOffset == offset.top) && (ts > te)) {
          e.stopPropagation(); // Bypass event to allow scroll
        } else if ((scrollOffset == offset.top) && (ts < te)) {
          return; // Return to restrict scroll
        } else {
          e.stopPropagation(); // Allow scroll
        }
      }
    });*/

    /************************** Restrict iOS Bounce Effect *************************/


    function onDeviceReady() {
      // $rootScope.deviceUuid = "1234567890";
      $rootScope.deviceUuid = window.device.uuid;
      $scope.checkConnection();
      // $rootScope.platform = "iOS";      

      //checking device platform
      $rootScope.platform = device.platform;
      $rootScope.version = device.version;

      if ($rootScope.platform === "iOS") {
        $rootScope.cordovaConfig = {
          "imageQuality": 100,
          "height": 1024,
          "width": 1024
        }
      } else if ($rootScope.platform === "Win32NT") {
        $rootScope.cordovaConfig = {
          "imageQuality": 100,
          "width": 1024, //give the reason why comment out this line
          "height": 1024
        }
      } else {
        $rootScope.cordovaConfig = {
          "imageQuality": 100,
          "height": 1024,
          "width": 1024
        }
      }

      // Check flag to see if EFT Details are already filled
      if (localStorage.getItem('eftFlag') === undefined || localStorage.getItem('eftFlag') === null) {
        localStorage.setItem('eftFlag', false);
      }
    }



  };

  $rootScope.getToken = function(callback) {
    $('.masking').show(); //added to fix signup issue
    if (localStorage.getItem('token') === null || localStorage.getItem('token') === '' || localStorage.getItem('token') === undefined) {
    //  $('.masking').show(); //commented to fix signup issue 
      secreteKeyService.getToken(function(err, res) {
        if (res) {
          $('.masking').hide();
          localStorage.setItem('token', JSON.stringify(res));
          $rootScope.token = JSON.parse(localStorage.getItem('token'));
          secreteKeyService.getKey($rootScope.token, function(err, res) {
            if (res) {
              $rootScope.secKey = res;
              return callback(true);
            } else {
              $('.masking').hide();
            }
          });
        } else {
          $('.masking').hide();
        }
        return callback(false);
      });
    } else {
      $rootScope.token = JSON.parse(localStorage.getItem('token'));
      secreteKeyService.getKey($rootScope.token, function(err, res) {
        if (res) {
          $rootScope.secKey = res;
          $('.masking').hide(); //added to fix signup issue
          return callback(true);
          // localStorage.setItem('eftFlag', false);
        } else {
          console.log(err);
          if (err == "ERR_403") {
            secreteKeyService.updateNewKey(function(err, res) {
              if (res) {
                console.log(res);
              } else {
                console.log(err);
              }
            })
          }
          $('.masking').hide();
        }
        return callback(false);
      });
    }
  };

  $scope.checkConnection = function() {
    var checkConnection = navigator.onLine ? "online" : "offline";

    document.addEventListener('online', updateOnlineStatus);
    document.addEventListener('offline', updateOfflineStatus);

    $rootScope.connection = checkConnection;

    document.addEventListener("backbutton", function() { // catch back button event            	

    });

    if (checkConnection == "offline") {
      $('#menu').trigger('close.mm'); //fix to close menubar
      $rootScope.loginRes = undefined;
      //show connection popup            
      $location.path('/');      
      $(".masking").hide();
      $('.blackMasking').hide();
      $(".network-message").show();
    } else {
      if (!$rootScope.secKey) {
        $rootScope.getToken(function(res) {
          console.log(response);
        });
      };

      //hide connection popup
      $(".network-message").hide();
    }

    function updateOfflineStatus(event) {
      var condition = navigator.onLine ? "online" : "offline";
      $rootScope.connection = condition;

      if ($rootScope.connectionType == 'wifi') {
        setTimeout(function() {
          if ($rootScope.connection != 'online') {
            $('#menu').trigger('close.mm'); //fix to close menubar
            $(".masking").hide();
            $('.blackMasking').hide();
            $('.secondLayerBlackMasking').hide();
            $('.terms-popup').hide();
            $rootScope.showHideMessageActionPopup('', '', false);
            $rootScope.$apply(function() {
              $rootScope.infoFlag = false;
              $location.path('/');
              $rootScope.loginRes = undefined;
            });
            $(".network-message").show(); //show connection popup
          };
        }, 2000);
      } else {
        setTimeout(function() {
          if ($rootScope.connection != 'online') {
            $('#menu').trigger('close.mm'); //fix to close menubar
            $(".masking").hide();
            $('.blackMasking').hide();
            $('.secondLayerBlackMasking').hide();
            $('.terms-popup').hide();
            $rootScope.showHideMessageActionPopup('', '', false);
            $rootScope.$apply(function() {
              $rootScope.infoFlag = false;
              $location.path('/');
              $rootScope.loginRes = undefined;
            });
            $(".network-message").show(); //show connection popup
          };
        }, 8000);
      }
    }

    function updateOnlineStatus(event) {
      $rootScope.connectionType = navigator.connection.type;
      var condition = navigator.onLine ? "online" : "offline";
      $rootScope.connection = condition;
      if (!$rootScope.secKey) {
        $rootScope.getToken(function(res) {
          console.log(response);
        });
      };
      //hide connection popup      
      $(".network-message").hide();
    }
  };


  // function for showing side menu
  $scope.openMenu = function() {
    $('.closeMenu a').click();
  };

  $scope.logout = function() {
    $('#menu').trigger('close.mm');
    if ($location.path() === "/submitClaim" && $("#uploadPhoto").css('display') === 'none' || $("#captureImg").css('display') === 'none' || $rootScope.receiptVal.length > 0) {
      $rootScope.popupButtonGroup = 'cancelClaim';
      $rootScope.showHideMessageActionPopup('WARNING', 'Current claim information will be discarded if you continue. Click Cancel to return to claim in progress.', true);
      $rootScope.$apply();
      $('.message-action-popup').css('height', $(window).height());
      $rootScope.setUrl = '/';
    } else {
      $location.path('/');
      $scope.loadLogin();
    }
  };

  $scope.loadLogin = function() {
    $rootScope.credentials = {};
    $rootScope.loginRes = undefined;
    $('.forgotten-pin').show();
    $rootScope.loginFlag = 'login';
    $rootScope.secondCredentialsFlag = 'pin';
    $rootScope.firstcredentialsFlag = 'mobileNo';
  };

  $scope.changePin = function() {
    $('#menu').trigger('close.mm');
    if ($location.path() === "/submitClaim" && $("#uploadPhoto").css('display') === 'none' || $("#captureImg").css('display') === 'none' || $rootScope.receiptVal.length > 0) {
      $rootScope.popupButtonGroup = 'cancelClaim';
      $rootScope.showHideMessageActionPopup('WARNING', 'Current claim information will be discarded if you continue. Click Cancel to return to claim in progress.', true);
      $rootScope.$apply();
      $('.message-action-popup').css('height', $(window).height());
      $rootScope.setUrl = '/changePin';
    } else {
      $location.path('/changePin');
    }
  };

  $scope.contactUs = function() {
    $('#menu').trigger('close.mm');
    if ($location.path() === "/submitClaim" && $("#uploadPhoto").css('display') === 'none' || $("#captureImg").css('display') === 'none' || $rootScope.receiptVal.length > 0) {
      $rootScope.popupButtonGroup = 'cancelClaim';
      $rootScope.showHideMessageActionPopup('WARNING', 'Current claim information will be discarded if you continue. Click Cancel to return to claim in progress.', true);
      $rootScope.$apply();
      $('.message-action-popup').css('height', $(window).height());
      $rootScope.setUrl = '/contactUs';
    } else {
      $location.path('/contactUs');
    }
  };

  $scope.submitClaim = function() {
    $('#menu').trigger('close.mm');
    $rootScope.imgCaptureInst = true;
    $rootScope.restrictBackFlow = false;
    $location.path('/submitClaim');
  };

  $rootScope.showHideMessageActionPopup = function(header, message, flag) {
    if (flag) {
      $('.code-input').hide();
      $('.popup-header').html(header);
      $('.body-text').html(message);
      $('.message-action-popup').show();      
      var topHeight = ($rootScope.windowHeight / 2) / 2;
      $('.popup').css('margin-top', topHeight + 'px');
    } else {
      $('.popup-header').html(header);
      $('.body-text').html(message);
      $('.message-action-popup').hide();
    }
  };

  /**
   * closeTermsPopup
   *
   *This function is used to hide terms and conditions.
   * 
   */
  $scope.closeTermsPopup = function() {        
      $('.terms-popup').hide();
  };
});
