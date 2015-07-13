layaApp.controller('memberDetailsController', function($scope, $location, $rootScope, utilsService, termsService) {

    'use strict';
    /**
     * memberDetailsInit
     *
     *Initialize things on loding of member details screen
     * 
     */
    var dateError;
    $scope.memberDetailsInit = function() {
        //set header
        $('.homeHeader').show();
        $('.homeImg').show();
        $('.headerTxt').html('member details');        

        $(window).resize(function() {
            var tempHeight = $(window).height() - $('.homeHeader').height();
            $('.container').height(tempHeight);
            var tempCanvasHeight = $('.container').height() - $('.homeImg').height();
            $('.whiteCanvas').css('min-height', tempCanvasHeight - 55);
        });

        $("#ui-datepicker-div").css("left", ($(window).width() - 261) / 2);

        var tempHeight = $(window).height() - $('.homeHeader').height();
        $('.container').height(tempHeight);



        var tempCanvasHeight = $('.container').height() - $('.homeImg').height();
        $('.whiteCanvas').css('min-height', tempCanvasHeight - 55);

        //creating empty ng-model
        $scope.memberDetails = {};

        //fetching member details from local storage
        if (localStorage.getItem('memberDetails'))
        {
            utilsService.decrypt(localStorage.getItem('memberDetails'), function(err, res) {
                $scope.memberDetails = JSON.parse(res);
                $('#conditionCheckbox').attr('checked', true);
            });
        }
        $scope.memberDetails.memberNo = $rootScope.memberNo;        

        $('#dobInputday').on('blur', function(evt) {
            if ($scope.memberDetails.day && $scope.memberDetails.day.length == 1) {
                if (evt.keyCode != 8) {
                    $scope.memberDetails.day = "0" + $scope.memberDetails.day;
                    $scope.$apply();
                };                
            }
        });

        $('#dobInputday').keyup(function(e) {            
            var version = "";
            if($rootScope.platform === "iOS") {
              version = $rootScope.version.split(".")[0];
            }
            if($rootScope.platform === "iOS" && version === "7") {
              return;
            }
            if ($scope.memberDetails.day.length == 2) {
                if (e.keyCode != 8) {
                    $("#dobInputmonth").focus();
                }
            }
        });

        $('#dobInputmonth').on('blur', function(evt) {
            if ($scope.memberDetails.month && $scope.memberDetails.month.length == 1) {
                if (evt.keyCode != 8) {
                    $scope.memberDetails.month = "0" + $scope.memberDetails.month;
                    $scope.$apply();
                }
            }
        });

        $('#dobInputmonth').keyup(function(e) {
            var version = "";
            if($rootScope.platform === "iOS") {
              version = $rootScope.version.split(".")[0];
            }
            if($rootScope.platform === "iOS" && version === "7") {
              return;
            }
            if ($scope.memberDetails.month.length == 2) {
                if (e.keyCode != 8) {
                    $('#dobInputyear').focus();
                }
            }
        });
    };

    $scope.dateMaskingHide = function() {
        $(".blackMaskingDate").hide();
    }

    $scope.sleep = function(delay) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay)
            ;
    }

    /**
     * saveMemberDetails
     *
     * This function will validate all fields from member details form 
     * If all validations goes well,member details will get save in local storage
     * 
     */
    $scope.saveMemberDetails = function()
    {        
            $("input").blur();
        // setTimeout(function() {
            $scope.memberDetails.dob = "";
            $scope.memberDetails.day = $("#dobInputday").val();
            $scope.memberDetails.month = $("#dobInputmonth").val();
            $scope.memberDetails.year = $("#dobInputyear").val();

            $scope.memberDetails.dob = $("#dobInputday").val() + "/" + $("#dobInputmonth").val() + "/" + $("#dobInputyear").val();
            // $scope.memberDetails.dob = $("#dobInput").val();

            var date = new Date();
            var currentDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
            var currentDateParts = currentDate.split('/');
            var currentDt = new Date(currentDateParts[2], currentDateParts[1] - 1, currentDateParts[0]);
            var dobParts;
            var dob;

            dobParts = $scope.memberDetails.dob.split('/');
            dob = new Date(dobParts[2], dobParts[1] - 1, dobParts[0]);

            if (!$scope.memberDetails.memberNo || !$scope.memberDetails.firstName || !$scope.memberDetails.surName || (!$scope.memberDetails.day && !$scope.memberDetails.month && !$scope.memberDetails.year))
            {
                $rootScope.infoHeader = 'ERROR';
                $('.infoText').html('Please enter all the details.');
                $('.blackMasking').show();
                $('#focusB').focus();
                $rootScope.infoFlag = true;
                $rootScope.$apply();
                $('#conditionCheckbox').attr('checked', false);
            }
            else if ($scope.memberDetails.memberNo.length < 10) {
                $rootScope.infoHeader = 'ERROR';
                $('.infoText').html('Please enter 10 digit Member Number.');
                $('.blackMasking').show();
                $('#focusB').focus();
                $rootScope.infoFlag = true;
                $rootScope.$apply();
                $('#conditionCheckbox').attr('checked', false);
            }
            else if (isDate($scope.memberDetails.dob) == false)
            {
                $rootScope.infoHeader = 'ERROR';
                $('.infoText').html(dateError);
                $('.blackMasking').show();
                $('#focusB').focus();
                $rootScope.infoFlag = true;
                $rootScope.$apply();
                $('#conditionCheckbox').attr('checked', false);

            }
            else if (dob.getTime() > currentDt.getTime())
            {
                $rootScope.infoHeader = 'ERROR';
                $('.infoText').html("Please enter valid DOB");
                $('.blackMasking').show();
                $('#focusB').focus();
                $rootScope.infoFlag = true;
                $rootScope.$apply();
                $('#conditionCheckbox').attr('checked', false);
            }
            else if ($('#conditionCheckbox').attr('checked'))
            {
                $rootScope.infoHeader = 'SUCCESS';
                $('.infoText').html('Member details saved successfully.');
                $('.blackMasking').show();
                $('#focusB').focus();
                $rootScope.infoFlag = true;
                $rootScope.$apply();

                $scope.memberDetails.firstName = $scope.capitalize($scope.memberDetails.firstName);
                $scope.memberDetails.surName = $scope.capitalize($scope.memberDetails.surName);

                utilsService.encrypt(JSON.stringify($scope.memberDetails), function(err, res) {
                    localStorage.setItem('memberDetails', res);

                });

                var memberDetails = '';
                utilsService.decrypt(localStorage.getItem('memberDetails'), function(err, res) {
                    memberDetails = JSON.parse(res);
                });

                $('.homeImgTxt').html(memberDetails.firstName);
                $('.sideMenuUpperTxt').html(memberDetails.firstName);
            }
            else {
                $rootScope.infoHeader = 'WARNING';
                $('.infoText').html('You must accept Laya Healthcare\'s terms and conditions to proceed.');
                $('.blackMasking').show();
                $('#focusB').focus();
                $rootScope.infoFlag = true;
                $rootScope.$apply();
            }
        // }, 1000);
    };

    $scope.capitalize = function(string) {
        return string[0].toUpperCase() + string.slice(1);
    };

    $scope.openDatePicker = function() {
        $("#dobInput").datepicker({
            changeYear: true,
            changeMonth: true,
            yearRange: '1900:2113',
        });
        $(".blackMaskingDate").show();
        $("#ui-datepicker-div").css("left", ($(window).width() - 261) / 2);
        $("#ui-datepicker-div").css("top", ($(window).height() - 240) / 2);
        $("#ui-datepicker-div").css("z-index", 10000);
    }

    /**
     * showTerms
     *
     *This function is used to show terms and conditions.
     * 
     */
    $scope.showTerms = function() {
        $(".masking").show();
        $("input").blur();
        if (!$rootScope.terms) {
            termsService.fetchTerms(function(err, res) {
                if (res) {
                    $(".masking").hide();                    
                    $('#termsAndConditions').html('');
                    $('#termsAndConditions').append(res);
                    $rootScope.terms = res;                    
                    $('.terms-popup').show();
                    $('.termsData').scrollTop(0);
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
            $('#termsAndConditions').html('');
            $('#termsAndConditions').append($rootScope.terms);            
            $('.terms-popup').show();
            $('.termsData').scrollTop(0);
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

    //function to set the focus to the text field for selected option
    $scope.setFocus = function(id) {
        $("#" + id).focus();
    }

    /*
     * Code to validate date start
     */
    var dtCh = "/";
    var minYear = 1900;
    var maxYear = $rootScope.copyrightYear;

    function isInteger(s) {
        var i;
        for (i = 0; i < s.length; i++) {
            // Check that current character is number.
            var c = s.charAt(i);
            if (((c < "0") || (c > "9")))
                return false;
        }
        // All characters are numbers.
        return true;
    }

    function stripCharsInBag(s, bag) {
        var i;
        var returnString = "";
        // Search through string's characters one by one.
        // If character is not in bag, append to returnString.
        for (i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            if (bag.indexOf(c) == -1)
                returnString += c;
        }
        return returnString;
    }

    function daysInFebruary(year) {
        // February has 29 days in any year evenly divisible by four,
        // EXCEPT for centurial years which are not also divisible by 400.
        return (((year % 4 == 0) && ((!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28);
    }
    function DaysArray(n) {
        var DaysArray = [];
        for (var i = 1; i <= n; i++) {
            DaysArray[i] = 31
            if (i == 4 || i == 6 || i == 9 || i == 11) {
                DaysArray[i] = 30
            }
            if (i == 2) {
                DaysArray[i] = 29
            }
        }
        return DaysArray
    }

    function isDate(dtStr) {
        var daysInMonth = DaysArray(12)
        var pos1 = dtStr.indexOf(dtCh)
        var pos2 = dtStr.indexOf(dtCh, pos1 + 1)
        var strDay = dtStr.substring(0, pos1)
        var strMonth = dtStr.substring(pos1 + 1, pos2)
        var strYear = dtStr.substring(pos2 + 1)
        var strYr = strYear
        if (strDay.charAt(0) == "0" && strDay.length > 1)
            strDay = strDay.substring(1)
        if (strMonth.charAt(0) == "0" && strMonth.length > 1 && strMonth.length < 3)
            strMonth = strMonth
        for (var i = 1; i <= 3; i++) {
            if (strYr.charAt(0) == "0" && strYr.length > 1)
                strYr = strYr.substring(1)
        }
        var month = parseInt(strMonth)
        var day = parseInt(strDay)
        var year = parseInt(strYr)
        if (pos1 == -1 || pos2 == -1) {
            dateError = "The date format should be : dd/mm/yyyy";
            return false
        }
        if (month < 1 || month > 12) {
            dateError = "Please enter a valid month";
            return false
        }
        if (strMonth.length < 2) {
            dateError = "Please enter a two digit valid month";
            return false
        }
        if (strDay.length < 1 || day < 1 || day > 31 || (month == 2 && day > daysInFebruary(year)) || day > daysInMonth[month]) {
            dateError = "Please enter a valid day";
            return false
        }
        if (strYear.length != 4 || year == 0 || year < minYear || year > maxYear) {
            dateError = "Please enter a valid 4 digit year between " + minYear + " and " + maxYear;
            return false
        }
        if (dtStr.indexOf(dtCh, pos2 + 1) != -1 || isInteger(stripCharsInBag(dtStr, dtCh)) == false) {
            dateError = "Please enter a valid date";
            return false
        }
        return true
    }
    /* Date validation ends*/
});