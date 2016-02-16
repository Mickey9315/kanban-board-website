(function() {

  var loginController = function($scope, $location, $mdToast, loginFactory) {

    $scope.username = this.username;
    $scope.password = this.password;

    //Login function
    $scope.authenticate = function() {
      loginFactory.authenticate($scope.username, $scope.password)
        .success(function(response) {
          if(response.success) { //authentication successful
            //Save the JSON web token returned
            $mdToast.show($mdToast.simple().textContent("token: " + response.token));
            //Go to kanban application
            $location.path('/kanban');
          } else { //authentication error
            $mdToast.show($mdToast.simple().textContent("Error: " + response.message));
          }
        });
    };

    //Switch to register page
    $scope.goRegister = function() {
      $location.path('/register');
    };

  };

  loginController.$inject = ['$scope', '$location', '$mdToast', 'loginFactory'];

  angular.module('kanban-board')
    .controller('loginController', loginController);

}());
