(function() {

  var kanbanFactory = function($http) {
    var factory = {};

    factory.getCards = function() {
      return $http.get('/cards');
    };

    factory.createCard = function(card) {
      return $http.post('/cards', card);
    };

    factory.editCard = function(card) {
      return $http.put('/cards/' + card._id, card);
    }

    return factory;
  };

  kanbanFactory.$inject = ['$http'];

  angular.module('kanban-board').factory('kanbanFactory', kanbanFactory);

}());
