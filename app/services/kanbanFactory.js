(function() {

  var kanbanFactory = function($http) {
    var factory = {};

    factory.getCards = function(token, userID) {
      return $http.get('/cards', { headers: {'x-access-token': token, 'x-user-id':userID } });
    };

    factory.createCard = function(card, token) {
      return $http.post('/cards', card, { headers: {'x-access-token': token } });
    };

    factory.editCard = function(card, token) {
      return $http.put('/cards/' + card._id, card, { headers: {'x-access-token': token } });
    }

    factory.logout = function() {
      return $http.post('/logout');
    }

    return factory;
  };

  kanbanFactory.$inject = ['$http'];

  angular.module('kanban-board').factory('kanbanFactory', kanbanFactory);

}());
