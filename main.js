var app=require("app");
var globalShortcut = require('global-shortcut');
app.on("window-all-closed",function(){
  app.quit();
})
app.on("ready",function(){
  var ret = globalShortcut.register('ctrl+alt+d', function() {
    mWindow.getWindow().openDevTools();
  });
  var mWindow=require("./mainWindow");
  mWindow.open("index.html",{width:1400,height:800});
})

//require("./device/index.js").list(console.log.bind(console));
