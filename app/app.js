(function() {

  var app = angular.module('kanban-board', [angularDragula(angular), 'ngMaterial', 'ngAnimate', 'ngMessages', 'ngRoute']);

  app.config(function($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'loginController',
        templateUrl: 'views/login.html'
      })
      .when('/login', {
        controller: 'loginController',
        templateUrl: 'views/login.html'
      })
      .when('/kanban', {
        controller: 'kanbanController',
        templateUrl: 'views/kanban.html'
      })
      .otherwise( { redirectTo: '/' } );
    });

}());
