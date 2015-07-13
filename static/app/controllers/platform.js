app.controller("platform.build",function($scope,$q,task,$state,domain,ngDialog,storage,fhc,buildQueue,$rootScope){
  $scope.tasks=task.getTaskListForDomain($scope.getCurDomain());
  $scope.params={
    tag:"1.0.0",
    certpass:""
  };
  $scope.buildName="";
  $scope.addCredentials=addCredentials;
  $scope.domain=null;
  $scope.credentials=[];
  $scope.gitRefs=[];
  var steps=["project","app","gitRef","cloud_app","environment","platform","bundleId","keypass","certpass","tag"];
  domain.loadUrl($scope.getCurDomain().url,function(err,d){
    if (err){
      alert(err);
    }else{
      $scope.domain=d;
      $scope.$apply();
      $scope.$broadcast("load_stop_initProject");
      syncCredentials();
      syncGitRef();
    }
  });
  $scope.set=function(key,val){
    $scope.params[key]=val;
    if (key === "app" && $scope.domain){
      $scope.gitRefs=[];
      syncGitRef();
    }
  }
  $scope.build=function(){
    buildQueue.queue($scope.getCurDomain().url,JSON.parse(angular.toJson($scope.params)));
    //var defer=$q.defer();
    //fhc.build($scope.getCurDomain().url,JSON.parse(angular.toJson($scope.params)),function(err,res){
      //defer.resolve();
      //console.log(arguments);
    //});
    //return defer.promise;
  }
  $scope.loadTask=function(){
    ngDialog.openConfirm({
      template:"./tmpl/loadBuild.html",
      scope:$scope
    }).then(function(params){
      $scope.params={};
      for (var key in params){
        $scope.set(key,params[key]);
        //$scope.params[key]=params[key];
      }
    });
  }
  $scope.saveTask=function(){
    ngDialog.openConfirm({
      template:"./tmpl/saveBuild.html",
      scope:$scope
    }).then(function(buildName){
      var d=$scope.getCurDomain();
      if (!d.savedBuild){
        d.savedBuild=[];
      }
      d.savedBuild.push({
        "name":buildName,
        "params":$scope.params
      });
      storage.save("domain");
    });
  }
  function syncGitRef(){
    var pid=$scope.params.project;
    var appId=$scope.params.app;
    if (!pid || !appId){
      return;
    }
    $scope.$broadcast("load_start_gitref");
    $scope.domain.getGitRefs(pid,appId,function(err,res){
      if (err){
        alert(err);
      }else{
        $scope.gitRefs=res;
      }
      $scope.$apply();
      $scope.$broadcast("load_stop_gitref");
    });
  }
  function syncCredentials(){
    $scope.$broadcast("load_start_credentials");
    $scope.domain.getCredentials(function(err,res){
      if (err){
        alert(err);
      }else{
        $scope.credentials=res[1];
      }
      $scope.$apply();
      $scope.$broadcast("load_stop_credentials");
    });
  }
  function addCredentials(){
    //https://tke-de-poc.feedhenry.com/#projects/9hNbwJ8F74QyQwjbAFpbnJoD/apps/9hNbwMmm6Losa07VVVXOzKuI/credentials
    var util=require("util");
    var url=util.format("%s/#projects/%s/apps/%s/credentials",$scope.getCurDomain().url,$scope.params.project,$scope.params.app);
    $scope.openWebview(url,function(){
      syncCredentials();
    });
  }
});

app.controller("platform.buildHistory",function($scope,domain,fhc,deploy){
  $scope.domain=null;
  $scope.builds=[];
  $scope.curApp="";
  domain.loadUrl($scope.getCurDomain().url,function(err,d){
    if (err){
      alert(err);
    }else{
      $scope.domain=d;
      $scope.$apply();
      $scope.$broadcast("load_stop_initApps");
    }
  });
  $scope.showHistory=function(app,pro){
    $scope.curApp=app;
    var aid=app.guid;
    var pid=pro.guid;
    fhc.artifacts($scope.getCurDomain().url,pid,aid,function(err,res){
      $scope.$broadcast("load_stop_"+aid);
      if (err){
        alert(err);
      }else{
        $scope.builds=res[1];
        console.log(res[1])
        $scope.flushScope();
      }
    });
  }
  $scope.download=function(build){
    deploy.downloadBuild(build.downloadurl);
  }
  $scope.ota=function(build){
    deploy.copyOta(build.otaurl);
    alert("OTA Link has been copied to clipboard");
  }

  $scope.qr=function(build){
    deploy.showQr(build.otaurl);
  }
  $scope.install=function(build){
    deploy.install(build.downloadurl.replace(".zip",".ipa"),build.destination,$scope.curApp.title);
  }
});
