module.exports = {
  list: list,
  createLogStream:createLogStream,
  ready:false,
  installBin:installBin
}

var child_proc = require("child_process");
var spawn = child_proc.spawn;
var eol = require("os").EOL;
var async=require("async");
function check(){
  var files=["idevicename","idevice_id","ideviceinstaller","idevicesyslog"];
  var fs=require("fs");
  async.eachSeries(files,function(item,scb){
    if (!fs.existsSync(getPath()+item)){
      scb(item);
    }else{
      scb(null);
    }
  },function(err){
    if (err){
      console.log("IOS is not ready.");
    }else{
      console.log("IOS is ready.");
      module.exports.ready=true;
    }
  });
}
function getPath() {
  return "/usr/local/bin/";
}

function list(cb) {
  run("idevicename", function(err, d) {
    if (err) {
      cb(null,[]);
    } else {
      run("idevice_id", ["-l"], function(err, d1) {
        if (err) {
          cb(err);
        } else {
          var dArr = d.split(eol);
          var d1Arr = d1.split(eol);
          var rtn = [];
          for (var i = 0; i < dArr.length; i++) {
            if (dArr[i] && d1Arr[i]) {
              rtn.push({
                name: dArr[i],
                guid: d1Arr[i],
                type: "apple",
                binType:"ipa"
              });
            }
          }
          cb(null, rtn);
        }
      });
    }
  });
}

function runStream(cmd,args){
  var fullP = getPath() + cmd;
  var proc = spawn(fullP, []);
  proc.stdout.pipe(process.stdout);
  proc.on("close",function(){
    console.log("process closed");
  });
  proc.stdout.on("data",function(d){
  })
  proc.stderr.on("data",function(d){
  })
  return proc;
}
function run(cmd, args, cb) {
  if (typeof cb === "undefined") {
    cb = args;
    args = [];
  }
  var fullP = getPath() + cmd;
  var proc = spawn(fullP, args);
  var buffer = "";
  proc.stdout.on("data", function(data) {
    buffer += data.toString("utf8");
  });
  proc.stderr.on("data", function(data) {
    buffer += data.toString("utf8");
  });
  proc.on('close', function(code) {
    if (code != 0) {
      cb("Command " + cmd + " exit with code: " + code,buffer);
    } else {
      cb(null, buffer);
    }
  });
}
function installBin(binFile,device,cb){
  var args=["-u",device.guid,"-i",binFile];
  console.log("install bin for ios",args);
  run("ideviceinstaller",args,function(err,d){
    console.log(arguments);
    cb(err,d);
  });
}
function createLogStream(device){
  var proc=runStream("idevicesyslog",["-u",device.guid]);
  var rs=proc.stdout;
  rs.proc=proc;
  return rs;
}
check();
