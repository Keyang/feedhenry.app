app.controller("home",function($scope,$state,storage,$sce,$rootScope,$timeout,util){
  $scope.addDomainClick=addDomainClick;
  $scope.storage=storage;
  $scope.openPlatform=openPlatform;
  $scope.openDevice=openDevice;
  $scope.getDomainUrl=getDomainUrl;
  $scope.getCurDomain=getCurDomain;
  $scope.getCurIndex=getCurIndex;
  $scope.openWebview=openWebview;
  $scope.util=util;
  $scope.url="";
  $scope.curDevice=null;
  $scope.flushScope=flushScope;
  $scope.back=function(){
    $state.go("^");
  }
  var curDomain=-1;
  function flushScope(){
    $timeout(function(){
      $scope.$apply();
    });
  }
  function getCurIndex(){
    return curDomain;
  }
  function getCurDomain(){
    return storage.get("domain")[curDomain>=0?curDomain:0];
  }
  function getDomainUrl(){
    return $sce.trustAsResourceUrl(getCurDomain().url);
  }
  function addDomainClick(){
    $scope.newDomain={};
    $state.go("home.newDomain")
  }

  function openPlatform(index){
    curDomain=index;
    $state.go("home.platform");
  }
  function openDevice(d){
    $scope.curDevice=d;
    $state.go("home.device");
  }
  function openWebview(url,cb){
    $rootScope.$broadcast("showWebview",url,cb);
  }
});
app.controller("home.menu",function($scope,buildQueue,ngDialog,$interval,deploy,device,installQueue){
  $scope.buildQ=buildQueue;
  $scope.installQ=installQueue;
  $scope.download=download;
  $scope.ota=ota;
  $scope.qr=qr;
  $scope.error=error;
  $scope.device=device;
  $scope.refreshDevice=refreshDevice;
  $scope.install=install;
  $scope.loadDevice=false;
  function download(obj){
    deploy.downloadBuild(obj.res.action.url);
  }
  function ota(obj){
    deploy.copyOta(obj.res.action.ota_url);
    alert("OTA Link has been copied to clipboard");
  }
  function qr(obj){
    deploy.showQr(obj.res.action.ota_url);
  }
  function error(obj){
    alert(obj.error || obj.props.msg);
  }
  function install(obj){
    deploy.install(obj.res.action.url.replace(".zip",".ipa"),obj.param.destination,obj.param.appName);
  }
  function refreshDevice(){
    $scope.loadDevice=true;
    var device=require("remote").require("./device");
    device.list(function(err,d){
      $scope.loadDevice=false;
      if (err){
        alert(err);
      }else{
        $scope.devices=d;
      }
      $scope.flushScope();
    });
  }
});


app.controller("home.newDomain",function($scope,fhc,storage,$q){
  $scope.addDomain=addDomain;
  $scope.newDomain={
  };
  function addDomain(){
    //TODO check if domain exists
    var defer=$q.defer();
    fhc.auth($scope.newDomain.url,$scope.newDomain.username,$scope.newDomain.password,function(err){
      if (err){
        alert(err.toString());
      }else{
        //as fhc maintains the sessions. we do not store the user crendentials.
        delete $scope.newDomain.username;
        delete $scope.newDomain.password;
        storage.add("domain",$scope.newDomain);
        $scope.newDomain={};
        $scope.openPlatform(storage.get("domain").length-1);
      }
      defer.resolve();
    });
    return defer.promise;
  }
});
app.controller("home.platform",function($scope,fhc,$q,task,$state){
  $scope.tasks=task.getTaskListForDomain($scope.getCurDomain());
  $scope.performTask=performTask;
  $scope.filterOut=filterOut;
  $scope.searchStr="";
  function filterOut(task,searchStr){
    if (task.name.toLowerCase().indexOf(searchStr.toLowerCase())===-1){
      return true;
    }else{
      return false;
    }
  }
  function performTask(t){
    task.performTask(t,$scope);
    //var name=task.getTaskName(t);
    //$state.go("home.platform."+name);
  }
});
app.controller("home.device",function($scope,fhc,$q,task,$state){
  $scope.showLog=showLog;


  function showLog(){
    require("remote").getCurrentWindow().showLog($scope.curDevice);
  }

});
