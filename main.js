var app=require("app");
app.on("window-all-closed",function(){
  app.quit();
})
app.on("ready",function(){
  var mWindow=require("./mainWindow");
  mWindow.open("index.html",{width:1400,height:800});
})

//require("./device/index.js").list(console.log.bind(console));
