var Progress=function(){
  var progressBar=null;
  var mask=null;
  this.newBar=function(max, progressText,startText){
    if (progressBar!=null){
progressBar.progressbar( "destroy" );
    }
    if (typeof progressText === "undefined"){
      progressText="";
    }
    if (typeof startText ==="undefined"){
      startText="Loading...";
    }
    progressBar=$("#mask_progressbar");
    progressBar.progressbar({
      max:max,
      change:function(){
        var val = progressBar.progressbar( "value" ) || 0;
        var pgText=progressText+val+" / "+max;
        progressBar.find(".progress-label").text(pgText);
      }
    });
    progressBar.find(".progress-label").text(startText);
    if (mask===null){
      mask=$("#progressMasking");
    }
  }
  this.progress=function(value){
    if (typeof value ==="undefined"){
      var val = progressBar.progressbar( "value" ) || 0;
      progressBar.progressbar( "value", val + 1 );
    }else{
      progressBar.progressbar( "value", value);
    }
  }
  this.hide=function(){
    mask.hide();
    progressBar.progressbar( "destroy" );
    progressBar=null;
  }
  this.show=function(){
    mask.show();
  }
  this.setText=function(text){
    progressBar.find(".progress-label").text(text);
  }
}
layaApp.service("progressService",Progress);
