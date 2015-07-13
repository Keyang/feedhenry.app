app.factory("storage",function(){
  var exports={};
  exports.add=add;
  exports.get=get;
  exports.getBy=getBy;
  exports.save=save;
  exports.rm=rm;

  var data={
    domain:[]
  }
  function save(name){
    var v=data[name];
    if (v){
      _save(name,v);
    }
  }
  function getBy(name,con){
    var v=data[name];
    if (v){
      for (var i=0;i<v.length;i++){
        var o=v[i];
        for (var key in con){
          if (o[key] == con[key]){
            return o;
          }
        }
      }
    }
  }
  function rm(name,i){
    var v=data[name];
    if (v){
      v.splice(i,1);
      _save(name,v);
    }
  }
  function get(name){
    return data[name];
  }
  function add(name,d){
    var v=data[name];
    if (v){
      delete d.$$hashKey;
      v.push(d);
      _save(name,v);
    }
  }


  function _save(key,val){
    //for (var i=0;i<val.length;i++){
      //delete val[i].$$hashKey;
    //}
    localStorage.setItem(key,angular.toJson(val));
  }

  function _read(key){
    var str=localStorage.getItem(key);
    if (str){
      return JSON.parse(str); 
    }else{
      return [];
    }
  }
  function _init(){
    for (var key in data){
      data[key]=_read(key);
    }
  }
  _init();
  return exports;
});
