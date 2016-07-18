(function() {

  var loginController = function($scope, $location, $mdDialog, $mdToast, $window, userFactory) {

    $scope.username = this.username;
    $scope.password = this.password;

    //Error dialog
    $scope.showAlert = function() {
    $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(false)
        .title('Error')
        .textContent('There is a network error. Check your connection.')
        .ariaLabel('Error dialog')
        .ok('Ok')
      );
    };

    //Login function
    $scope.authenticate = function() {
      userFactory.authenticate($scope.username, $scope.password)
        .success(function(response) {
          if(response.success) { //authentication successful
            //Save the returned JSON web token into the sessionStorage
            $window.sessionStorage.token = response.token;
            //Save the returned user ID into the sessionStorage
            $window.sessionStorage.userID = response.user._id;
            //Save the username
            $window.sessionStorage.username = response.user.username;
            //Save the email
            $window.sessionStorage.email = response.user.email;
            //Go to kanban application
            $location.path('/kanban');
          } else { //authentication error
            $mdToast.show($mdToast.simple().textContent("Error: " + response.message));
          }
        })
        .error(function(response, status) {
          $scope.showAlert();
        });
    };

    //Switch to register page
    $scope.goRegister = function() {
      $location.path('/register');
    };

  };

  loginController.$inject = ['$scope', '$location', '$mdDialog', '$mdToast', '$window', 'userFactory'];

  angular.module('kanban-board')
    .controller('loginController', loginController);

}());
