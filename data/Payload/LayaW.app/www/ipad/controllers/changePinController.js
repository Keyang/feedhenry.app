layaApp.controller('changePinController', function($scope, $rootScope, changePinService) {

    'use strict';
    /**
     * pinInit
     *
     * Initailsation function setting dynamic height and keypress events.
     * @Author Ashish Bhargava
     */
    $scope.pinInit = function() {
        $('.homeImg').show();
        $('#homeHeader').show();
        $('.headerTxt').html('change pin');
        var tempHeight = $(window).height() - $('.homeHeader').height();
        $('.container').height(tempHeight);
        var tempCanvasHeight = $('.container').height() - $('.homeImg').height();
        $('.whiteCanvas').css('min-height', tempCanvasHeight - 65);
        $('#pinError').hide();

        $(window).resize(function() {
            var tempHeight = $(window).height() - $('.homeHeader').height();
            $('.container').height(tempHeight);
            var tempCanvasHeight = $('.container').height() - $('.homeImg').height();
            $('.whiteCanvas').css('min-height', tempCanvasHeight - 65);            
        });

        $('.changePinData input').keypress(function() {
            $('#pinError').hide();
            $scope.pin_error = '';
        });
    };

    /**
     * validate
     *
     * Function for validating and calling service layer function to change pin
     * 
     */
    $scope.validate = function() {
        $("input").blur();
        if ($scope.pin === undefined) {
            $scope.showErrorPopup("ERROR","All fields are empty");
        } else if ($scope.pin.current === undefined || $scope.pin.current === '') {            
            $scope.showErrorPopup("ERROR","Enter four digit current pin.");
        } else if ($scope.pin.new === undefined || $scope.pin.new2 === undefined || $scope.pin.new === '' || $scope.pin.new2 === '') {            
            $scope.showErrorPopup("ERROR","Enter four digit new pin and confirm pin.");
        } else if ($scope.pin.current == $scope.pin.new) {
            $scope.showErrorPopup("ERROR","Current pin should be different from new pin.");
        } else if ($scope.pin.new .length < 4 || $scope.pin.new2.length < 4 || $scope.pin.current.length < 4) {        
            $scope.showErrorPopup("ERROR","Pin should be four digit.");
        } else {
            if ($scope.pin.new != $scope.pin.new2) {                
                $scope.showErrorPopup("ERROR","Confirmation pin and new pin do not match.");
            } else {
                $('#pinError').hide();
                $scope.pin_error = '';
                $(".masking").show();
                changePinService.changePin($scope.pin, function(err, res) {
                    if (res) {
                        $(".masking").hide();                        
                        $rootScope.infoHeader = 'SUCCESS';
                        $('.infoText').html(res.response.payload.changePin.status.message);
                        $('.blackMasking').show();
                        $rootScope.infoFlag = true;
                        $scope.pin = "";
                        $scope.$apply();
                    } else {
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

    $scope.showErrorPopup = function(header, message) {
        $rootScope.infoHeader = header;
        $('.infoText').html(message);
        $('.blackMasking').show();
        $rootScope.infoFlag = true;
    };

    //function to set the focus to the text field for selected option
    $scope.setFocus = function(id) {
        $("#" + id).focus();
    }


});