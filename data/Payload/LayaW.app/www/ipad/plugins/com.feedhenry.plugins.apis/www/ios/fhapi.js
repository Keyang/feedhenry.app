cordova.define("com.feedhenry.plugins.apis.FHAPI_IOS", function(require, exports, module) { var loadOverride = function() {
  var $fh = window.$fh;

  if (typeof $fh === "undefined" || typeof $fh.__dest__ === "undefined") {
    return;
  }

  $fh.__dest__.send = function(p, s, f) {
    function getAsArray(input) {
      var ret = [];
      if (input) {
        if (typeof input === "string") {
          ret = [input];
        } else {
          ret = input;
        }
      }
      return ret;
    }
    if (p.type == "email") {
      var isHtml = false;
      var to = getAsArray(p.to);
      var cc = getAsArray(p.cc);
      var bcc = getAsArray(p.bcc);
      var attachments = getAsArray(p.attachments);
      if (p.isHtml) {
        isHtml = true;
      }
      if (navigator.emailcomposer || (window.plugins && window.plugins.EmailComposer)) {
        var emailcomposer = navigator.emailcomposer || window.plugins.EmailComposer;
        emailcomposer.showEmailComposerWithCallback(function(res){
          var result = "Unknown";
          for(var key in emailcomposer.ComposeResultType){
              if(emailcomposer.ComposeResultType[key] == res){
                  result = key;
                  break;
              }
          }
          if (result.toLowerCase().indexOf("fail") > -1) {
            f(result);
          } else {
            s(result);
          }
        }, p.subject || "", p.body || "", to, cc, bcc, isHtml, attachments);
      } else {
        return f("send_nosupport");
      }
    } else if (p.type == "sms") {
      if (window.plugins && (window.plugins.smsComposer || window.plugins.smsBuilder)) {
        var smsComposer = window.plugins.smsBuilder || window.plugins.smsComposer;
        smsComposer.showSMSBuilderWithCB(function(result) {
          var status = 'Failed'; // default to failed
          if (result === 0) {
            status = 'Cancelled';
          } else if (result === 1) {
            status = 'Sent';
          } else if (result === 2) {
            status = 'Failed';
          } else if (result === 3) {
            status = 'NotSent';
          }

          if (status === 'Failed') {
            f(status);
          } else {
            s(status);
          }
        }, p.to, p.body);
        return;
      } else {
        f('send_sms_nosupport', {}, p);
        return;
      }
    } else {
      f('send_nosupport', {}, p);
      return;
    }
  };

  $fh.__dest__.is_playing_audio = false;

  $fh.__dest__.audio = function(p, s, f) {
    if (!$fh.__dest__.is_playing_audio && !p.path) {
      f('no_audio_path');
      return;
    }
    var streamImpl = null;
    if (navigator.stream || (window.plugins && window.plugins.stream)) {
      streamImpl = navigator.stream || window.plugins.stream;
    }
    if (!streamImpl) {
      return f('audio_nosupport');
    }
    var acts = {
      'play': function() {
        streamImpl.play(p, function() {
          $fh.__dest__.is_playing_audio = true;
          s();
        }, f);
      },

      'pause': function() {
        streamImpl.pause(p, s, f);
      },

      'stop': function() {
        streamImpl.stop(p, function() {
          $fh.__dest__.is_playing_audio = false;
          s();
        }, f);
      }
    };

    acts[p.act] ? acts[p.act]() : f('audio_badact');
  };

  $fh.__dest__.webview = function(p, s, f) {
    var webviewImpl = null;
    if (navigator.webview || (window.plugins && window.plugins.webview)) {
      webviewImpl = navigator.webview || window.plugins.webview;
    }
    if (!webviewImpl) {
      return f('webview_nosupport');
    }
    if (!('act' in p) || p.act === 'open') {
      if (!p.url) {
        f('no_url');
        return;
      }
      webviewImpl.load(p, s, f);
    } else {
      if (p.act === "close") {
        webviewImpl.close(p, s, f);
      }
    }
  };


  $fh.__dest__.file = function(p, s, f) {
    if (typeof FileTransfer === "undefined") {
      return f("file_nosupport");
    }
    var errors = ['file_notfound', 'file_invalid_url', 'file_connection_err', 'file_server_err', 'file_user_cancelled'];
    if (typeof navigator.fileTransfer === "undefined") {
      navigator.fileTransfer = new FileTransfer();
    }
    var acts = {
      'upload': function() {
        if (!p.filepath) {
          f('file_nofilepath');
          return;
        }
        if (!p.server) {
          f('file_noserver');
          return;
        }
        var options = {};
        if (p.filekey) {
          options.fileKey = p.filekey;
        }
        if (p.filename) {
          options.fileName = p.filename;
        }
        if (p.mime) {
          options.mimeType = p.mime;
        }
        if (p.params) {
          options.params = p.params;
        }
        navigator.fileTransfer.upload(p.filepath, p.server, function(result) {
          s({
            status: result.responseCode,
            res: unescape(result.response),
            size: result.bytesSent
          });
        }, function(errorResult) {
          var error = errorResult.code;
          var err = 'file_unknown';
          if (1 <= error <= 4) {
            err = errors[error - 1];
          }
          f(err);
        }, options);
      },

      'download': function() {
        if (!p.src) {
          f('file_nofilesrc');
          return;
        }
        if (!p.dest) {
          f('file_nofiledest');
          return;
        }
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
          var appDir = fs.root.fullPath;
          var downloadTarget = [appDir, "Downloads", p.dest].join("/");
          if (p.progressListener && typeof p.progressListener === "function") {
            navigator.fileTransfer.onprogress = function(progressEvent) {
              p.progressListener(progressEvent.loaded / progressEvent.total);
            };
          }
          navigator.fileTransfer.download(p.src, downloadTarget, function(entry) {
            s(entry.fullPath);
          }, function(error) {
            if (error.code === FileTransferError.FILE_NOT_FOUND_ERR) {
              return f(errors[0]);
            } else if (error.code === FileTransferError.INVALID_URL_ERR) {
              return f(errors[1]);
            } else if (error.code == FileTransferError.CONNECTION_ERR) {
              return f(errors[2]);
            } else if (error.code === FileTransferError.ABORT_ERR) {
              return f(errors[4]);
            }
          }, false, {
            headers: p.headers
          });
        }, function(err) {
          return f(err.target.error.code);
        });
      },

      'cancelDownload': function() {
        navigator.fileTransfer.abort();
      },

      'open': function() {
        if (!p.filepath) {
          f('file_nopath');
          return;
        }
        var ref = window.open(p.filepath, "_system", {});
        ref.addEventListener('loadstop', function() {
          s();
        });
        ref.addEventListener('loaderror', function() {
          f();
        });
      },

      'list': function() {
        if (!p.url) {
          f('file_nourl');
          return;
        }
        if (navigator.ftputil || (window.plugins && window.plugins.ftputil)) {
          var ftputil = navigator.ftputil || window.plugins.ftputil;
          ftputil.list(function(list) {
            s({
              list: list
            });
          }, function(err) {
            if (err == 1) {
              f(errors[2]);
            } else if (err == 5) {
              f(errors[1]);
            }
          }, p);
        } else {
          f('file_ftplist_nosupport');
        }
      }
    };

    var actfunc = acts[p.act];
    if (actfunc) {
      actfunc();
    } else {
      f('file_badact');
    }
  };

  $fh.__dest__.push = function(p, s, f) {
    if (typeof PushNotification === "undefined") {
      return f("push_no_impl");
    }
    var acts = {
      'register': function() {
        var onRegistration = function(event) {
          if (!event.error) {
            s({
              deviceToken: event.pushID
            });
          } else {
            f(event.error);
          }
        };
        document.addEventListener("urbanairship.registration", onRegistration, false);

        PushNotification.isPushEnabled(function(enabled) {
          if (enabled) {
            PushNotification.registerForNotificationTypes(PushNotification.notificationType.sound | PushNotification.notificationType.alert | PushNotification.notificationType.badge);
          } else {
            PushNotification.enablePush(function() {
              PushNotification.registerForNotificationTypes(PushNotification.notificationType.sound | PushNotification.notificationType.alert | PushNotification.notificationType.badge);
            });
          }
        });

        document.addEventListener("resume", function() {
          PushNotification.resetBadge();
        }, false);
        document.addEventListener("pause", function() {
          document.removeEventListener("urbanairship.registration", onRegistration, false);
        }, false);
      },

      'receive': function() {
        var onPush = function(event) {
          if (event.message) {
            s(event.message);
          }
        };
        PushNotification.getIncoming(onPush);
        PushNotification.isPushEnabled(function(enabled) {
          if (enabled) {
            document.addEventListener("urbanairship.push", onPush, false);
          } else {
            PushNotification.enablePush(function() {
              document.addEventListener("urbanairship.push", onPush, false);
            });
          }
        });

        document.addEventListener("resume", function() {
          PushNotification.getIncoming(onPush);
        }, false);
        document.addEventListener("pause", function() {
          document.removeEventListener("urbanairship.push", onRegistration, false);
        }, false);
      }
    };

    acts[p.act] ? acts[p.act]() : f('push_badact');
  };

  document.addEventListener('deviceready', function() {
    $fh._readyState = true;
    document.removeEventListener('deviceready', arguments.callee, false);
    while ($fh._readyCallbacks && $fh._readyCallbacks.length > 0) {
      var f = $fh._readyCallbacks.shift();
      try {
        f();
      } catch (e) {
        console.log("Error during $fh.ready. Skip. Error = " + e.message);
      }
    }
  }, false);
}

//since these overrides are loaded by cordova asynchronously via script injection, there is a chance that this file is loaded before
//the feedhenry sdk file is loaded. Then the overrides won't work. So if that is the case, delay the load of the overrides.
if (typeof window.$fh !== "undefined" && typeof window.$fh.__dest__ !== "undefined") {
  loadOverride();
} else {
  setTimeout(function() {
    loadOverride();
  }, 200);
}

});
