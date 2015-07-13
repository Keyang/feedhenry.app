layaApp.controller('aboutController', function($scope, $rootScope, aboutService) {

    'use strict';

    /**
     * aboutInit
     * Initialisation function for setting header
     * @Author Ashish Bhargava
     */
    $scope.aboutInit = function() {
        $('.homeImg').hide();
        $('#homeHeader').show();
        $('.headerTxt').html('about');
        var tempHeight = $(window).height() - $('.homeHeader').height();
        $('.container').height(tempHeight);
        $scope.loadAboutUsPage();
    };

    $scope.loadAboutUsPage = function() {
        $(".masking").show();
        if (!$rootScope.aboutUsData) {
            aboutService.fetchAboutUs(function(err, res) {
                if (res) {
                    $(".masking").hide();                    
                    $('.aboutPara').html('');
                    $('.aboutPara').append(res);
                    $rootScope.aboutUsData = res;                    
                    $scope.$apply();
                }
                else {
                    $(".masking").hide();
                    $rootScope.infoHeader = 'ERROR';
                    $('.infoText').html(err);                    
                    $rootScope.infoFlag = true;
                    $scope.$apply();
                }
            });
        }
        else {
            $(".masking").hide();            
            $('.aboutPara').html('');
            $('.aboutPara').append($rootScope.aboutUsData);            
        }
    };
});