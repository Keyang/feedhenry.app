app.controller("splash",function($scope,$timeout,$state){
  $timeout(function(){
    $state.go("home");
  },3000);
});
