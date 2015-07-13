app.factory("domain",function(fhc){
  function Domain(url){this.url=url;}
  Domain.loadUrl=function(url,cb){
    var d=new Domain(url);
    d.load(function(err){
      if (err){
        cb(err);
      }else{
        cb(null,d);
      }
    });
  }

  Domain.prototype.load=function(cb){
    fhc.projects(this.url,function(err,res){
      if (err){
        cb(err);
      }else{
        this.props=res[1];
        cb();
      }
    }.bind(this));
  }
  Domain.prototype.getProjects=function(){
    return this.props;
    //var rtn=[];
    //for (var p in this.props){
      //rtn.push({
        //id:p.guid,
        //name:p.title
      //});
    //}
    //return rtn;
  }
  Domain.prototype.getApps=function(projectId){
    var p=this.props.filter(function(item){
      return item.guid==projectId;
    });
    return p[0].apps;
  }
  Domain.prototype.getBuildableApps=function(projectId){
    var apps=this.getApps(projectId);
    var rtn=apps.filter(function(item){
      return item.buildable===true;
    });
    return rtn;
  }
  Domain.prototype.getAppType=function(p){
    //TODO complete this list
    switch (p.type){
      case "client_hybrid":
        return "html5";
      case "client_advanced_hybrid":
        return "cordova";
      case "cloud_nodejs":
        return "nodejs";
      default:
        return "cordova";
    }
  }
  Domain.prototype.getCloudApps=function(pid){
    var apps=this.getApps(pid);
    var rtn=apps.filter(function(item){
      return item.client===false;
    });
    return rtn;
  }
  Domain.prototype.getEnvs=function(){
    return ["dev","live"];
  }
  Domain.prototype.getPlatforms=function(){
    return ["android","iphone","ipad","ios","blackberry","windowsphone7","windowsphone"];
  }
  Domain.prototype.getCredentials=function(cb){
    fhc.credentials(this.url,function(err,res){
      if (err){
        cb(err);
      }else{
        cb(null,res);
      }
    });
  }
  Domain.prototype.getGitRefs=function(pid,appId,cb){
    fhc.remote(this.url,pid,appId,cb);
  }

  return Domain;
});
