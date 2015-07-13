app.factory("data",function(){
  var fs=require("fs");
  var exports={
    getPath:getPath
  };
  var cwd=process.cwd();
  var dataDir=cwd+"/data/";
  if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
  }
  function getPath(fname){
    return dataDir+fname;
  }
  return exports;
});
