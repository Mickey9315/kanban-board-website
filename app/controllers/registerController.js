(function() {

  var registerController = function($scope, $location, $mdToast, loginFactory) {

    $scope.username = this.username;
    $scope.password = this.password;
    $scope.email = this.email;

    //Register function
    $scope.register = function() {
      loginFactory.register($scope.username, $scope.email, $scope.password)
        .success(function(response) {
          if(response.success) { //User registered
            //Save the JSON web token returned
            $mdToast.show($mdToast.simple().textContent("token: " + response.token));
            //Go to kanban application
            $location.path('/kanban');
          } else { //register error
            $mdToast.show($mdToast.simple().textContent("Error: " + response.message));
          }
        });
    };

    //Switch to login page
    $scope.goLogin = function() {
      $location.path('/login');
    };

  };

  registerController.$inject = ['$scope', '$location', '$mdToast', 'loginFactory'];

  angular.module('kanban-board')
    .controller('registerController', registerController);

}());
