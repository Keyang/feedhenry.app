layaApp.service('submitClaimService', function($rootScope, utilsService, secreteKeyService,progressService,$location) {
  this.submitClaim = function(data, callback) {
    //Capturing device UUID
    //        var deviceUuid = '1234567890' // device.uuid;
    var temp = data;
    var self=this;
    var _callback=callback;
    callback=function(err,res){
      progressService.hide();
      _callback(err,res);
    }
    utilsService.encrypt(JSON.stringify(temp), function(err, res) {
      if (res) {
        var param = {
          "request": {
            "header": {
              //                                            "deviceUdid": deviceUuid
              "deviceUdid": $rootScope.deviceUuid
            },
            "payload": {
              "submitClaim": res

            }
          }
        }

        var receipts=data.receipts;
        progressService.newBar(receipts.length,"Progress: ","Upload Claim...");
        progressService.show();
        $fh.cloud({
            "path": "submitClaimAction",
            "data": param,
            "secure": true,
            "timeout": 60000
          },
          function(res) {
            progressService.progress();
            var returned=false;
            function _iterator(i,cb){
              if (i <receipts.length){
                var r=receipts[i];
                var t=setTimeout(function(){
                   returned=true;
                   return cb("Uploading receipt timeout. Please try again later.") ;
                },60*1000);
                self.sendFile(r.img,function(err){
                  clearTimeout(t);
                  if (returned==true){
                    return;
                  }
                  progressService.progress();
                  if (err){
                    //var error = JSON.parse(err);
                    returned=true;
                    return cb("Receipts sending failed. Please try again later.");
                  }else{
                    i++;
                    setTimeout(function() {
                      _iterator(i, cb);
                    })
                  }
                });
              }else{
                returned=true;
                cb(null);
              }
            } 
            _iterator(0,function(err){
              if (err){
               return callback(err,null);
              }else{
                progressService.setText("Finalising...");
                var param = {
                  "request": {
                    "header": {
                      //                                            "deviceUdid": deviceUuid
                      "deviceUdid": $rootScope.deviceUuid
                    },
                    "payload": {}
                  }
                }

                $fh.cloud({
                  "path":"submitFinalise",
                  "data":param,
                  "secure":true,
                  "timeout":60000
                },function(){
                  return callback(null,true);
                },function(msg,err){
                  if (msg === "") {
                    return callback("Request timeout. Please check your connection and try again.", null);
                  }
                  var error = JSON.parse(msg);
                  if (error.response.payload.error.status == "ERR_403") { //checking if token expired
                    secreteKeyService.updateNewKey(function(err, res) {
                      if (res) {
                        console.log(res);
                      } else {
                        console.log(err);
                      }
                    });
                    return callback("Something went wrong. Please try again.", null);
                  }
                  return callback(error.response.payload.error.message, null);
                });
              }
            });
          },
          function(msg, err) {
            if (msg === "") {
              return callback("Request timeout. Please check your connection and try again.", null);
            }
            var error = JSON.parse(msg);
            if (error.response.payload.error.status == "ERR_403") { //checking if token expired
              secreteKeyService.updateNewKey(function(err, res) {
                if (res) {
                  console.log(res);
                } else {
                  console.log(err);
                }
              })
              return callback("Something went wrong. Please try again.", null);
            }
            return callback(error.response.payload.error.message, null);
          });
      };

    });


  }
  this.streamFile=function(filePath,cb){
    var url=$fh.getCloudURL()+"/streamFile/"+$rootScope.deviceUuid+"?filePath="+filePath;
    var ft=new FileTransfer();
    ft.upload(filePath,url,function(){
        cb(null);
    },function(err){
        cb(err);
    },{});
  }
  this.postFile=function(filePath,cb){
    var endPoint="uploadFile";
    resolveLocalFileSystemURI(filePath,function(fe){
      fe.file(function(f){
        var reader=new FileReader();
        reader.onloadend=function(e){
          var fileContent=this.result;
          var obj={
            "filePath":filePath,
            "uuid":$rootScope.deviceUuid,
            "data":fileContent
          }
          utilsService.encrypt(JSON.stringify(obj), function(err, res) {
             var param = {
               "request": {
                 "header": {
                   "deviceUdid": $rootScope.deviceUuid
                 },
                 "payload": res  
               }
             }
            $fh.cloud({
              "path":endPoint,
              "contentType":"application/json",
              "data":param,
              "secure":true,
              timeout:60000
            },function(){
              cb(null);
            },function(msg){
              cb(msg);
            });
          });
        }
        reader.onerror=function(){
          cb("error");
        }
        reader.readAsDataURL(f);
      });
    });
  }
  this.sendFile=function(filePath,cb){
    if (typeof FileTransfer !="undefined"){ //if Cordova FileTransfer exists, use file uploader to stream file
      this.streamFile(filePath,cb);
    } else{ //file transfer not exists. Post file content to cloud instead
      this.postFile(filePath,cb);
    }
  }
});
