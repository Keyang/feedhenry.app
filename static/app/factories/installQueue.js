app.factory("installQueue", function($q, data,device,$rootScope,$timeout) {
  var exports = {
    queue: queue,
    all:getQ
  }
  var curObj = null;
  var insQ = [];
  var draining = false;
  var request = require("../node_modules/request");
  var curDefer = null;
  var async = require("../node_modules/async");
  var abort=false;
  function getQ(){
    return insQ;
  }
  function queue(url, device,appName) {
    var obj=new Install({
      url: url,
      device: device,
      progress: 0,
      msg:"",
      status:"pending",
      appName:appName
    });
    obj.install();
    insQ.push(obj);
  }
  function Install(conf){
    this.props=conf;
  }
  Install.prototype.flush=function(){
    $timeout(function(){
      $rootScope.$apply();
    })
  }
  Install.prototype.install=function(){
    var defer = $q.defer();
    //1. check file exists or download 
    var fileName = require("crypto").createHash("md5").update(this.props.url).digest("hex");
    var fullPath = data.getPath(fileName)+"."+this.props.device.binType;
    console.log("fullpath",fullPath);
    var fs = require("fs");
    async.series([

      function(scb) {
        if (!fs.existsSync(fullPath)) {
          console.log("file not existed,download");
          var ws = fs.createWriteStream(fullPath);
          request.get(this.props.url).on("response", function(res) {
            console.log(res);
            var length = parseInt(res.headers["content-length"]);
            if (isNaN(length)){
              length=0;
            }
            console.log("filesize: "+length);
            var transfered = 0;
            res.on("data", function(d) {
              if (abort){
                //TODO abort request
                scb("abortted");
                return;
              }
              transfered += d.length;
              if (transfered>length){
                transfered=length;
              }
              this.props.progress = transfered / length*0.9;
              this.flush();
              console.log(this.props.progress);
            }.bind(this));
            res.pipe(ws);
            ws.on("error",function(){
             scb("error writing file"); 
            });
            ws.on("finish",function(){
              scb(null);
            });
          }.bind(this));
        }else{
          scb(null);
        }
      }.bind(this),
      function (scb){
        console.log("file downloaded. start to install");
        this.props.progress=0.9;
        device.installBin(fullPath,this.props.device,function(err,d){
          this.props.msg=d;
          scb();
        }.bind(this));
        this.flush();
      }.bind(this)
    ], function(e) {
      abort=false;
      this.props.progress=1;
      this.props.status="finished";
      this.flush();
      if (e){
        this.props.msg=e;
        defer.reject(e);
      }else{
        defer.resolve();  
      }
    }.bind(this));

    return defer.promise;
  }
  Install.prototype.curObj=function(){
    return this.props;
  }

  return exports;
});
