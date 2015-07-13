app.factory("sys",function(){
  var exports={
    setBadge:setBadge,
    setProgress:setProgress,
    bounce:bounce
  };
  var remote=require("remote");
  var app=remote.require("app");
  var b=remote.getCurrentWindow();
  function setBadge(str){
    app.dock.setBadge(str.toString());
  }
  function setProgress(val){
    b.setProgressBar(val);
  }
  function bounce(isCritical){
    if (process.platform==="darwin"){
      if (isCritical){
        app.dock.bounce("critical");
      }else{
        app.dock.bounce();
      }
    }
  }

  return exports;
});
