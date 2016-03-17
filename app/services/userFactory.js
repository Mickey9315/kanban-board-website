(function() {

  var userFactory = function($http) {
    var factory = {};

    factory.getUsers = function(token) {
      return $http.get('/users', { headers: {'x-access-token': token } });
    };

    factory.getUserById = function(userID, token) {
      return $http.get('/users/' + userID, { headers: {'x-access-token': token } });
    };

    factory.authenticate = function(username, password) {
      var jsonObject = { username: username, password: password };
      return $http.post('/users/authenticate', jsonObject);
    };

    factory.register = function(username, email, password) {
      var jsonObject = { username: username, password: password, email: email };
      return $http.post('/users/register', jsonObject);
    };

    return factory;
  };

  userFactory.$inject = ['$http'];

  angular.module('kanban-board').factory('userFactory', userFactory);

}());
