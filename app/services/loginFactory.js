(function() {

  var loginFactory = function($http) {
    var factory = {};

    factory.getUsers = function(token) {
      var jsonObject = { token: token };
      return $http.get('/users', jsonObject);
    };

    factory.authenticate = function(username, password) {
      var jsonObject = { username: username, password: password };
      return $http.post('/authenticate', jsonObject);
    };

    factory.register = function(username, email, password) {
      var jsonObject = { username: username, password: password, email: email };
      return $http.post('/register', jsonObject);
    }

    return factory;
  };

  loginFactory.$inject = ['$http'];

  angular.module('kanban-board').factory('loginFactory', loginFactory);

}());
