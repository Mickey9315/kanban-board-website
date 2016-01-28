(function() {

  var loginController = function($scope, $location) {
    $scope.login = function() {
      $location.path('/kanban');
    };
  };

  loginController.$inject = ['$scope', '$location'];

  angular.module('kanban-board')
    .controller('loginController', loginController);

}());
