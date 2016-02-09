(function() {

//WORK IN PROGRESS

  var loginFactory = function($http) {
    var factory = {};

    factory.getUsers = function() {
      return $http.get('/users');
    };

    factory.signin = function(username, password) {
      return $http.post('/signin', username, password);
    };

    factory.signup = function(username, password) {
      return $http.post('/signup', username, password);
    }

    return factory;
  };

  loginFactory.$inject = ['$http'];

  angular.module('kanban-board').factory('loginFactory', loginFactory);

}());
