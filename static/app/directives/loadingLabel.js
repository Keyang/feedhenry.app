app.directive("loadingLabel",function(){
  return {
    link:function(scope,ele,attr){
      var id=attr["loadingLabel"];
      var autoLoad=attr.autoLoad;
      scope.$on("load_start_"+id,function(){
        ele.addClass("animated fadeInOut infinite");
      });
      scope.$on("load_stop_"+id,function(){
        ele.removeClass("animated fadeInOut infinite");
      });
      if (autoLoad){
        ele.addClass("animated fadeInOut infinite");
      }
    }
  } 
});
