layaApp.controller('homeController', function($scope, $location, $rootScope, utilsService) {

    'use strict';
    /**
     * homeInit
     *
     * Initailsation function setting dynamic height and keypress events.
     * @Author Ashish Bhargava
     */
    $scope.homeInit = function() {
        $('.homeHeader').show();
        $('.homeImg').show();
        $('.headerTxt').html('laya healthcare');
        setTimeout(function() {
            var marginTop = $(window).height() - ($('.homeHeader').height() + $('.homeImg').height() + $('#homeBtns').height());
            console.log($(window).height() + '-' + ($('.homeHeader').height() + '+' + $('.homeImg').height() + '+' + $('#homeBtns').height()));
            // $('.visitWebsiteBtn').css('margin-top', marginTop / 3);
        }, 100);

        var tempHeight = $(window).height() - $('.homeHeader').height();
        $('.container').height(tempHeight);
        $('.homeImg').width($(window).width());
        var memberDetails = "";
        if (localStorage.getItem('memberDetails') !== null) {
            utilsService.decrypt(localStorage.getItem('memberDetails'), function(err, res) {
                var memberDetails = JSON.parse(res);
                if (memberDetails.firstName !== undefined) {
                    $('.homeImgTxt').html(memberDetails.firstName);
                    $('.sideMenuUpperTxt').html(memberDetails.firstName);
                }

            });
        }

    };

    /**
     * submitClaim
     *
     * Function to navigate to submit claim screen.
     * 
     */
    $scope.submitClaim = function() {
        $('#menu').trigger('close.mm');
        $rootScope.receiptList = [];
        $rootScope.receiptVal = [];
        $rootScope.imgCaptureInst = true;
        $rootScope.restrictBackFlow = false;
        $location.path('/submitClaim');
    };

    /**
     * memberDetails
     *
     * Function to navigate to member details screen.
     * 
     */
    $scope.memberDetails = function() {
        $('#menu').trigger('close.mm');
        $location.path('/memberDetails');
    };

    /**
     * reviewClaim
     *
     * Function to navigate to review claim screen.
     * 
     */
    $scope.reviewClaim = function() {
        $('#menu').trigger('close.mm');
        $location.path('/reviewClaims');
    };

    /**
     * contactUs
     *
     * Function to navigate to contactUs screen.
     * 
     */
    $scope.contactUs = function() {
        $('#menu').trigger('close.mm');
        $location.path('/contactUs');
    };

    /**
     * openWebsite
     *
     * Function to open url in browser.
     * 
     */
    $scope.openWebsite = function() {
        window.open("http://www.layahealthcare.ie/", '_system', 'location=yes');
    }



});