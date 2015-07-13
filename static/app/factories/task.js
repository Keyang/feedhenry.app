app.factory("task",function($q,$state,$rootScope){
  var exports={};
  exports.getTaskListForDomain=getTaskListForDomain;
  exports.performTask=performTask;
  exports.getTaskName=getTaskName;

  var builtInTask=require("./platform.js");
  var tasks={
    buildApp:navigateTo.bind({},"home.platform.build"),
    studio:function(t,s){openWebview(s.getCurDomain().url);},
    buildHistory:navigateTo.bind({},"home.platform.buildHistory")
  }
  function getTaskListForDomain(domain){
    var rtn=[];
    rtn=rtn.concat(builtInTask);
    //TODO add domain tasks;
    return rtn;
  }
  function getTaskName(task){
    return task.toLowerCase().replace(" ","_");
  }


  function performTask(task,scope){
    var id=task.id;
    var func=tasks[id];
    if (func){
      func(task,scope);
    }else{
      alert("Not Implement Yet.");
    }
  }
  function navigateTo(target){
    $state.go(target);
  }
  function openWebview(url,cb){
    $rootScope.$broadcast("showWebview",url,cb);
  }

  return exports;
});
