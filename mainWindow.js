exports.open=open;
exports.getWindow=getWindow;

var BrowserWindow=require("browser-window");
var mWindow=null;

function open(name,params){
  if (mWindow===null){
    mWindow=new BrowserWindow(params);
    mWindow.loadUrl("file://"+__dirname+"/static/"+name);
    mWindow.showLog=showLog;
  }
}
function getWindow(){
  return mWindow;
}

function showLog(d){
  //var device=require("./device");
  //var rs=device.createLogStream(d);
  var logWindow=new BrowserWindow({
    width:1000,
    height:724
  });
  logWindow.loadUrl("file://"+__dirname+"/static/log.html");
  logWindow.getDevice=function(){
    return d;
  }
}
