(function() {

  var loginController = function($scope, $location, $mdToast, $window, userFactory) {

    $scope.username = this.username;
    $scope.password = this.password;

    //Login function
    $scope.authenticate = function() {
      userFactory.authenticate($scope.username, $scope.password)
        .success(function(response) {
          if(response.success) { //authentication successful
            //Save the returned JSON web token into the sessionStorage
            $window.sessionStorage.token = response.token;
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

  loginController.$inject = ['$scope', '$location', '$mdToast', '$window', 'userFactory'];

  angular.module('kanban-board')
    .controller('loginController', loginController);

}());
