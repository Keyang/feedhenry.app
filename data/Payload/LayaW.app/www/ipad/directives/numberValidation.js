//Directive to allow user to enter only number in the input field.
layaApp.directive('numbersOnly', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function(inputValue) {
                // this next if is necessary for when using ng-required on your input. 
                // In such cases, when a letter is typed first, this parser will be called
                // again, and the 2nd time, the value will be undefined                
                if (inputValue == undefined)
                    return ''
                var transformedInput = inputValue.replace(/[^0-9\.]/g, '');
                var temp = modelCtrl.$viewValue;
                if (inputValue.length > 5 && temp.indexOf('.') == -1) {                  
                  transformedInput = inputValue.slice(0,-1);
                }
                if (temp.indexOf('.') !== -1) {                  
                    if (temp.substring(temp.indexOf('.')).length > 3) {                        
                        var substr = temp.split('.');
                        transformedInput = substr[0]+"."+substr[1].substring(0, 2);
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                        return transformedInput;
                    }
                }
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }                
                return transformedInput;
            });
        }
    };
});

//Directive to allow user to enter only number in the input field.
layaApp.directive('maxNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function(inputValue) {
                // this next if is necessary for when using ng-required on your input. 
                // In such cases, when a letter is typed first, this parser will be called
                // again, and the 2nd time, the value will be undefined
                if (inputValue == undefined)
                    return ''
                var transformedInput = inputValue.replace(/[^0-9\.]/g, '');
                var temp = modelCtrl.$viewValue;
                if (inputValue.length > 5 && temp.indexOf('.') == -1) {
                  transformedInput = inputValue.slice(0,-1);
                }
                if (temp.indexOf('.') !== -1) {
                    if (temp.substring(temp.indexOf('.')).length > 3) {
                        var substr = temp.split('.');
                        transformedInput = substr[0]+"."+substr[1].substring(0, 2);
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                        return transformedInput;
                    }
                }
                 if (temp.length > 8) {
                    transformedInput = temp.substring(0,8);
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                    return transformedInput;
                }
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }
                return transformedInput;
            });
        }
    };
});

layaApp.directive('validNumber', function(){
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
       modelCtrl.$parsers.push(function (inputValue) {
           // this next if is necessary for when using ng-required on your input. 
           // In such cases, when a letter is typed first, this parser will be called
           // again, and the 2nd time, the value will be undefined
           if (inputValue == undefined) return '' 
           var transformedInput = inputValue.replace(/[^0-9]/g, ''); 
           if (transformedInput!=inputValue) {
              modelCtrl.$setViewValue(transformedInput);
              modelCtrl.$render();
           }         

           return transformedInput;         
       });
     }
   };
});


function MyCtrl($scope) {
    $scope.number = ''
}