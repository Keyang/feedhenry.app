//cordova camera fix
//defaultly, if destinationType is DATA_URL, savetoPhotoAlbum: true will not work as android implementation of cordova camera sucks. This fix will tweak the parameters and use html5 file api to retrieve data
//this fix was originally for android only.
//However camera also has problem on ios and windowsphone
$(function() {

  setTimeout(function() {

    (function() {
      if (typeof cordova != "undefined" &&  navigator && navigator.camera) {
        navigator.camera._getPicture = navigator.camera.getPicture;
        navigator.camera.getPicture = function(onSuccess, onFail, options) {
          if (options) {
            if (!options.destinationType) {
              options.destinationType = Camera.DestinationType.FILE_URI;
            }
            var _onSuccess = onSuccess;
            delete options.destinationType
            onSuccess = function(dataUrl) {
              window.resolveLocalFileSystemURI(dataUrl, function(fe) {
                if (options.destinationType && options.destinationType === Camera.DestinationType.DATA_URL) {
                  fe.file(function(f) {
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                      _onSuccess(this.result);
                    }

                    reader.readAsDataURL(f);
                  });
                } else {
                  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
                    var fileName = new Date().getTime();
                    var rootFolder="laya/";
                    if (cordova.platformId==="windowsphone"){
                      rootFolder="laya";
                    }
                    fs.root.getDirectory(rootFolder, {
                      create: true
                    }, function(fd) {
                      fe.copyTo(fd, fileName.toString(), function() {
                        var fullPath = fd.fullPath + "/" + fileName;
                        _onSuccess(fullPath);
                      }, function() {
                        onFail("File copying issue.");
                      });
                    }, function() {
                      onFail("Directory retriving issue.");
                    });
                  }, function() {
                    onFail("Filesystem Error.");
                  });
                }

              });
            }
          }



          navigator.camera._getPicture(onSuccess, onFail, options);
        }
      }

      window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    })();
  }, 5000);
});
