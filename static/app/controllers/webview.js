app.controller("webview",function($scope,$sce){
  $scope.show=false;
  $scope.src="";
  var onClose=null;
  $scope.$on("showWebview",function(e,url,onCloseFunc){
      onClose=onCloseFunc;
      $scope.src=$sce.trustAsResourceUrl(url);
      $scope.show=true;
  });

  $scope.close=function(){
    $scope.show=false;
    if (onClose && typeof onClose === "function"){
      onClose();
    }
  }

});
