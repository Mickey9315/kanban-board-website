(function() {

  var loginController = function($scope, $location) {
    $scope.login = function() {
      $location.path('/kanban');
    };
    $scope.register = function() {
      $location.path('/register');
    };
    $scope.goBackLogin = function() {
      $location.path('/login');
    };
  };

  loginController.$inject = ['$scope', '$location'];

  angular.module('kanban-board')
    .controller('loginController', loginController);

}());
