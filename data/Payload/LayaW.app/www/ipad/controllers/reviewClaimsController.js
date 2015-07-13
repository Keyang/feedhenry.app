layaApp.controller('reviewClaimsController', function($scope, $location, $rootScope, utilsService) {

    'use strict';
    /**
     * reviewClaimsInit
     *
     *Initialize things on loding of review claim screen
     * 
     */
    $scope.reviewClaimsInit = function() {
        //logic for setting header
        $('.homeHeader').show();
        $('.homeImg').show();
        $('.headerTxt').html('review claims');

        var tempHeight = $(window).height() - $('.homeHeader').height();
        $('.container').height(tempHeight);
        var tempCanvasHeight = $('.container').height() - $('.homeImg').height();
        $('.whiteCanvas').css('min-height', tempCanvasHeight - 55);

        //fetching claim details from local storage
        utilsService.decrypt(localStorage.getItem('claimList'), function(err, res) {
            $scope.cliamDeatails = JSON.parse(res);
            setTimeout(function() {
                $('.collapsible').collapsible({
                    defaultOpen: 'section1'
                });
            }, 100);
        });
    };

    /**
     * handleClaimList
     *
     * This function will handle collapsible claim list  
     * Will close one claim when another gets open
     * 
     */
    $scope.handleClaimList = function(param)
    {
        if ($('#nav-section' + param).collapsible('collapsed')) {
            $('#nav-section' + param).collapsible('open');
            $('.collapsible').collapsible('closeAll');
        }
    };
});