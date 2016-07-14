(function() {

  var registerController = function($scope, $location, $mdToast, $window, userFactory) {

    $scope.username = this.username;
    $scope.password = this.password;
    $scope.email = this.email;

    //Register function
    $scope.register = function() {
      userFactory.register($scope.username, $scope.email, $scope.password)
        .success(function(response) {
          if(response.success) { //User registered
            //Show a message to activate the user account
            $mdToast.show($mdToast.simple()
            .textContent("We have sent you an email to activate your Taskban account")
            .action('Ok')
            .highlightAction(true)
            .highlightClass('md-accent'));
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

  registerController.$inject = ['$scope', '$location', '$mdToast', '$window', 'userFactory'];

  angular.module('kanban-board')
    .controller('registerController', registerController);

}());
