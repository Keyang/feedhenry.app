layaApp.controller('contactUsController', function($scope) {

    'use strict';
    /**
     * contactUsInit
     * Initialisation function for setting header
     * @Author Ashish Bhargava
     */
    $scope.contactUsInit = function() {
        $('.homeImg').show();
        $('#homeHeader').show();
        $('.headerTxt').html('contact us');
        var tempHeight = $(window).height() - $('.homeHeader').height();
        $('.container').height(tempHeight);
        var tempCanvasHeight = $('.container').height() - $('.homeImg').height();
        $('.whiteCanvas').css('min-height', tempCanvasHeight - 65);
    };
    
    /**
     * openWebsite
     *
     * Function to open url in browser.
     * 
     */
    $scope.openWebsite = function() {
        window.open("http://www.layahealthcare.ie/", '_system', 'location=yes');
    };
});