module.exports={
  list:list,
  createLogStream:createLogStream,
  installBin:installBin
}
var ios=require("./apple.js");
var android=require("./android.js");
var async=require("async");

function init(){
  process.env["DYLD_LIBRARY_PATH"]=getPath()+":"+process.env["DYLD_LIBRARY_PATH"];
}

function list(cb){
  async.parallel(getReadyFuncs("list"),function(err,res){
    if (err){
      cb(err);
    }else{
      var rtn=[];
      res.forEach(function(item){
        rtn=rtn.concat(item);
      });
      cb(null,rtn);
    }
  });
}
function createLogStream(device){
  var lib=require("./"+device.type+".js");
  return lib.createLogStream(device);
}

function getReadyFuncs(funcName){
  var funcs=[];
  if (ios.ready){
    funcs.push(ios[funcName]);
  }
  if (android.ready){
    funcs.push(android[funcName]);
  }
  return funcs;
}
function installBin(binFile,device,cb){
  var lib=getLib(device);
  lib.installBin(binFile,device,cb);
}
function getLib(device){
  return require("./"+device.type+".js");
}
