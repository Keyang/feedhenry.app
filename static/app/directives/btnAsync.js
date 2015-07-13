app.directive("btnAsync", function($parse,$timeout) {
  return {
    restrict: "A",
    link: function(scope, ele, attr) {
      var id = attr["btnAsync"];
      var clickFn = $parse(attr["baClick"]);
      ele.append('<span style="display:none" class="btnLoader glyphicon glyphicon-refresh pull-right animated rotate infinite"></span>')
      ele.addClass("animated");
      var loading = false;
      scope.$on("load_stop_" + id, function() {
        loading = false;
        ele.children("span.btnLoader").fadeOut();
      });
      ele.on("click", function(e) {
        if (loading) {
          ele.removeClass("animated shake");
          $timeout(function(){
            ele.addClass("animated shake");
          },100);
          return;
        } else {
          ele.children("span.btnLoader").fadeIn();
          loading = true;
          clickFn(scope, {
            $event: e
          });
          //scope[id].apply(scope, arguments).then(function() {});
        }
      });
    }
  }
})
