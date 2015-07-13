module.exports = {
  list: list,
  createLogStream:createLogStream,
  ready:false,
  installBin:installBin
}

var child_proc = require("child_process");
var spawn = child_proc.spawn;
var eol = require("os").EOL;
function installBin(binFile,device,cb){
  var args=["-s",device.guid,"install","-r",binFile];
  console.log("install bin",args);
  run(args,function(err,d){
    console.log(arguments);
    cb(err,d);
  });
}
function check(){
  var aHome=process.env["ANDROID_HOME"] ;
  if (aHome){
    var fs=require("fs");
    if (fs.existsSync(getAdbPath())){
      module.exports.ready=true;
      console.log("Android is ready.");
      return;
    }
  }
  console.log("Android is not ready.");
}

function getAdbPath() {
  var aHome=process.env["ANDROID_HOME"] ;
  return aHome?aHome+ "/platform-tools/adb":"adb";
}

function list(cb) {
  run(["devices", "-l"], function(err, d) {
    if (err) {
      cb(null,[]);
    } else {
      var dArr = d.split(eol);
      while (dArr.length > 0 && dArr[0].indexOf("devices attached") === -1) {
        dArr.shift();
      }
      dArr.shift();
      var rtn = [];
      dArr.forEach(function(item) {
        var sp = item.split(" ");
        var deviceId = sp[0];
        while (sp.length > 0 && sp[0].indexOf("model") === -1) {
          sp.shift();
        }
        var name =deviceId;
        if (sp.length > 0) {
          name = sp[0].split(":")[1];
        }
        if (name && deviceId) {
          rtn.push({
            name: name,
            guid: deviceId,
            type: "android",
            binType:"apk"
          });
        }
      });
      cb(null, rtn);
    }
  });
}
function runStream(args){
  var fullP = getAdbPath();
  var proc = spawn(fullP, args);
  return proc;
}
function run(args, cb) {
  var fullP = getAdbPath();
  var proc = spawn(fullP, args);
  var buffer = "";
  proc.stdout.on("data", function(data) {
    buffer += data.toString("utf8");
  });
  proc.on('close', function(code) {
    if (code != 0) {
      cb("Command " + cmd + " exit with code: " + code,buffer);
    } else {
      cb(null, buffer);
    }
  });
  return proc;
}
function createLogStream(device){
  var proc=runStream(["-s",device.guid,"logcat"]);
  var rs=proc.stdout;
  rs.proc=proc;
  return rs;
}
check();
