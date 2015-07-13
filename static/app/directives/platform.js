app.directive("platform",function(storage){
  return {
    restrict:"E",
    link:function(scope,ele,attr){
      var wv;
      wv=document.createElement("webview");
      $(wv).addClass("fullscreen");
      ele.append(wv);
      wv.addEventListener("new-window",function(e){
        require("shell").openExternal(e.url);
      });
        wv.src=attr.src;
      //initWv();
      //scope.$watch(function(){
        //return attr.src;
      //},function(){
        //if (attr.src && attr.src!=wv.getUrl()){
          //initWv();
        //}
      //});
      function initWv(){
      }
      //wv.nodeintegration="1";
    }
  }
});
