app.factory("buildQueue",function(sys,fhc,$q,$interval,$timeout){
  var exports={
    queue:queue,
    finished:getFinished,
    building:getBuilding,
    all:all
  };
  var buildQ=[]; 
  var finishedQ=[];
  var draining=false;
  var curBuild=null;
  var curBuildDefer=null;
  function abort(){

  }
  function getFinished(){
    return finishedQ;
  }
  function getBuilding(){
    return buildQ;
  }
  function all(){
    return buildQ.concat(finishedQ);
  }
  function queue(url,params){
    buildQ.push({
      "url":url,
      "param":params,
      "hash":require("crypto").createHash("md5").update(url).update(JSON.stringify(params)).digest("hex"),
      "status":"waiting",
      "progress":0,
      "error":"",
      "res":null,
      "started":Date.now()
    });
    sys.bounce();
    drain();
  }
  function setProgress(v){
    curBuild.progress=v;
    sys.setProgress(v);
  }

  function drain(){
    if (buildQ.length>0 && draining===false){
      curBuild=buildQ[0];
      draining=true;
      var num=buildQ.length;
      sys.setBadge(num);
      setProgress(0);
      build(buildQ[0]).then(function(res){
        console.log(res);
        setProgress(100);
        curBuild.status="finished";
        curBuild.finishedDate=Date.now();
        curBuild.res=res[1][0][0];
        finishedQ.unshift(buildQ.shift());
        sys.setBadge("");
        draining=false;
        drain();
      })
      .catch(function(err){
        curBuild.status="error";
        curBuild.error=err;
        finishedQ.unshift(buildQ.shift());
        sys.setBadge("");
        draining=false;
        drain();
      })
      
    }else if (buildQ.length === 0){
      sys.bounce();
      draining=false;
      sys.setProgress(-1);
    }
  }

  function fakeProgress(){
    var prog=curBuild.progress;
    var most=(1-prog)*0.1;
    var incVal=most*Math.random();
    setProgress(prog+incVal);
  }
  function build(obj){
    curBuildDefer=$q.defer();
    var url=obj.url;
    var param=obj.param;
    var fakeProc=$interval(fakeProgress,800);
    curBuild.status="pending";
    //$timeout(function(){
      //$interval.cancel(fakeProc);
      //curBuildDefer.resolve(
        //[{},[[{
        //action:{
          //"url":"https://laya-cc.feedhenry.com/digman/ios-v3/dist/67d47eec-6b4f-4f1c-9a5a-3fccd0954673/ios~6.0~7784~LayaW.zip?digger=diggers.digger107e",
          //"ota_url":"https://laya-cc.feedhenry.com/digman/ios-v3/dist/67d47eec-6b4f-4f1c-9a5a-3fccd0954673/LayaW.plist?digger=diggers.digger107e"
        //}
      //}]]]
      //);
    //},1000);
    fhc.build(url,param,function(err,res){
      $interval.cancel(fakeProc);
      if (err){
        curBuildDefer.reject(err);
      }else{
        curBuildDefer.resolve(res);
      }
    });
    return curBuildDefer.promise;

  }

  return exports;
});
