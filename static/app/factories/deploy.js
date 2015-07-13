app.factory("deploy",function($rootScope,ngDialog,data,installQueue){
  var exports={
    downloadBuild:downloadBuild,
    copyOta:copyOta,
    showQr:showQr,
    install:install
  };
  window.m1=exports;

  function downloadBuild(url){
    require("shell").openExternal(url);
  }
  function copyOta(otaUrl){
    require("clipboard").writeText(otaUrl);
  }

  function showQr(otaUrl){
    var ota_url=otaUrl;
    var scope=$rootScope.$new();
    scope.url=ota_url;
    ngDialog.open({
      "template":"<img ng-src='https://api.qrserver.com/v1/create-qr-code/?size=512x512&data={{url}}'/>",
      plain:true,
      scope:scope
    });
  }
  // https://docs.google.com/uc?authuser=0&id=0ByuKQDQ-pFtiV0F4bFpqWVBaOFU&export=download
  function install(url,deviceType,appName){
    if (deviceType === "ios"){
      deviceType="apple";
    }
    ngDialog.openConfirm({
      "template":"./tmpl/deviceList.html",
      controller: ['$scope', function($scope ) {
        $scope.openDevice=function(d){
          $scope.confirm(d);
        }
        $scope.mType=deviceType;
      }]
    }).then(function(d){
      installQueue.queue(url,d,appName);
    });
  }


  return exports;
});
