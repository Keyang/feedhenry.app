app.factory("device",function($interval){
  var exports={
    list:list,
    refreshDevice:refreshDevice,
    installBin:installBin
  };
  var devices=[]; 
  var device=require("../device");
  function list(){
    return [].concat(devices);
  }
  function refreshDevice(cb){
    device.list(function(err,d){
      if (err){
       if (cb && typeof cb ==="function") cb(err);
      }else{
        devices=d;
        if (cb && typeof cb==="function") cb(null);
      }
    });
  }
  function installBin(binFile,d,cb){
    device.installBin(binFile,d,cb);
  }
  refreshDevice();
  $interval(refreshDevice,5000);
  return exports;
});
