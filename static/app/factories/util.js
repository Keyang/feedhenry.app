app.factory("util",function(){
  var exports={
    convertDestinationCls:convertDestinationCls
  };
  function convertDestinationCls(dist){
    if (dist === "ios"){
      return "apple";
    }
    if (dist.indexOf("win")>-1){
      return "windows";
    }

    return dist;
  }

 

  return exports;
});
