app.directive("centred",function(){
  return {
    restrict:"A",
    link:function(scope,ele,attr){
      ele.addClass("splash");
    }
  }
});
