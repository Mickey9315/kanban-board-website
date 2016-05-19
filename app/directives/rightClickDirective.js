(function() {
  
  //Right click custom directive
  var rightClickDirective = function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
  };

  rightClickDirective.$inject = ['$parse'];

  angular.module('kanban-board').directive('ngRightClick', rightClickDirective);

}());
