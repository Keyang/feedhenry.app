app.directive("splash",function(){
  return {
    restrict:"E",
    link:function(scope,ele,attr){
      ele.addClass("splash");
    }
  }
});
