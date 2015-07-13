/**
 *Laya history service.
 *This history service is NOT a normal history stack. It is a HACk to quickly fit into Laya existing app code base.
 *Normally this service will be incharge of all page changes but this means a numerous of code change.
 *To avoid much code change (high risk), this solution will be monitoring passively and add minimum code to existing code base.
 *The fall-back is this history service does not support (or not straight forward to support) multi-parent route node.
 *
 */

layaApp.service("historyService", function($rootScope, $location) {

  var route = {
    "login": {
      "parent": null,
      "path": "/"
    },
    "home": {
      "parent": "login",
      "path": "/home"
    },
    "changePin": {
      "parent": "home",
      "path": "/changePin"
    },
    "contactUs": {
      "parent": "home",
      "path": "/contactUs"
    },
    "about": {
      "parent": "home",
      "path": "/about"
    },
    "reviewClaims": {
      "parent": "home",
      "path": "/reviewClaims"
    },
    "submitClaim": {
      "parent": "home",
      "path": "/submitClaim",
      "backAction":function(){
        $("#homeAction").click(); //yes it is dirty.
      }
    },
    "memberDetails": {
      "parent": "home",
      "path": "/memberDetails"
    },
    "eft": {
      "parent": "home",
      "path": "/eft",
      "backAction":function(){
        $("#eftAction").click(); //yes it is dirty.
      }
    }
  }

  var currentRoute = [];

  function HistoryService() {}

  HistoryService.prototype.nameFromPath = function(path) {
    for (var key in route) {
      var p = route[key].path;
      if (p === path) {
        return key;
      }
    }
    return null;
  }

  //this will reset all current route. ONLY for LAYA.Aka its a hack.
  HistoryService.prototype.buildRoute = function(name) {
    currentRoute = [];
    while (name != null) {
      currentRoute.unshift(route[name]);
      name = route[name].parent;
    }
  }

  HistoryService.prototype.back = function() {
    if (currentRoute.length > 1) {      
      var path = $location.path();
      var curObj=currentRoute.pop();
      if (path == '/eft' || (path == '/submitClaim' && curObj.parent == 'home')) {
        if ($location.path() === "/submitClaim" && $("#uploadPhoto").css('display') === 'none' || $("#captureImg").css('display') === 'none' || $rootScope.receiptVal.length > 0) {
          $rootScope.restrictBackFlow = true;
          if (curObj.backAction){//if current object has a backaction defined.
            curObj.backAction(); //run it
          }else{ //redirect to  last route object
            var obj = currentRoute[currentRoute.length - 1];
            this.redirect(obj);
          }
          return;
        }        
      }    
      if (curObj.backAction){//if current object has a backaction defined.
        curObj.backAction(); //run it
      }else{ //redirect to  last route object
        var obj = currentRoute[currentRoute.length - 1];
        this.redirect(obj);
      }
    }
  }
  HistoryService.prototype.push=function(routeObj){
    currentRoute.push(routeObj);
  }
  HistoryService.prototype.redirect = function(routeObj) {
    if (routeObj.path) {
      var path = this.path();
      if (path===routeObj.path){
        return;
      }else{
          // location.hash=routeObj.path;
          $location.url(routeObj.path);
          $rootScope.$apply();
      }
    }else if (routeObj.action){
      routeObj.action();
    }
  }
  HistoryService.prototype.path = function() {
    return $location.path();
  }
  HistoryService.prototype.regRoute=function(name,routeObj){
    route[name]=routeObj;
  }
  var inst=new HistoryService();
  $rootScope.$on("$locationChangeSuccess", function() {
    var path=$location.path();
    var name=inst.nameFromPath(path);
    inst.buildRoute(name);
  });
  
  document.addEventListener("backbutton",function() {
    var path = $location.path();
    if ($rootScope.restrictBackFlow == undefined) {
      $rootScope.restrictBackFlow = false;
    };
    if(path != '/home' && ($('.message-action-popup').is(':visible') !== true && $('.message-popup').is(':visible') !== true && $('.blackMasking').is(':visible') !== true && $('.masking').is(':visible') !== true && $('.secondLayerBlackMasking').is(':visible') !== true && $('.progressMasking').is(':visible') !== true)) {        
        if ($rootScope.restrictBackFlow == false) {
          inst.back();
        }        
    }    
  });
  return inst;
});
