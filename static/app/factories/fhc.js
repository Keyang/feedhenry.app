app.factory("fhc", function() {
  var exports = {
    exec: _execInTarget,
    auth: auth,
    projects: projects,
    credentials: credentials,
    build: build,
    remote: remote,
    artifacts:artifacts
  };
  var fhc = require("../node_modules/fh-fhc");
  var async = require("../node_modules/async");
  var utils = require("util");
  function artifacts(url,pid,aid,cb){
    _execInTarget(url, ["artifacts", pid,aid], cb);
  }
  function remote(url, projectId, appId, cb) {
    target(url, function(err) {
      if (err) {
        cb(err);
      } else {
        fhc.req.GET(fhc.req.getFeedHenryUrl(), utils.format("box/api/projects/%s/apps/%s/remotes",
          projectId,
          appId
        ), cb);
      }
    })
  }

  function build(url, params, cb) {
    var args = ["build"];
    for (var key in params) {
      if (typeof params[key] === "object") {
        args.push(key + '=' + JSON.stringify(params[key]) + '');
      } else {
        args.push(key + '=' + params[key] + '');
      }
    }
    console.log(args);
    _execInTarget(url, args, cb);
  }

  function credentials(url, cb) {
    _execInTarget(url, ["credentials", "list"], cb);
  }

  function projects(url, cb) {
    _execInTarget(url, ["projects"], cb);
  }

  function auth(url, username, password, cb) {
    _execInTarget(url, ["login", username, password], cb);
  }

  function _execInTarget(url, args, conf, cb) {
    if (typeof cb === "undefined") {
      cb = conf;
      conf = {};
    }
    conf._exit = false;
    async.series([
      target.bind({}, url),
      _exec.bind({}, args, conf)
    ], cb);
  }

  function target(url, cb) {
    _exec(["target", url], {
      _exit: false
    }, cb);
  }

  function _exec(args, conf, cb) {
    fhc.load(conf, function(err) {
      if (err) {
        cb(err);
      } else {
        fhc.applyCommandFunction(args, cb);
      }
    });

  }

  window.m = exports;

  return exports;
});
