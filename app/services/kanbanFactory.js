(function() {

  var kanbanFactory = function($http) {
    var factory = {};

    factory.getCards = function(token) {
      var jsonObject = { token: token };
      return $http.get('/cards', jsonObject);
    };

    factory.createCard = function(cardContent, cardCategory, token) {
      var jsonObject = { cardContent: cardContent, cardCategory: cardCategory, token: token };
      return $http.post('/cards', jsonObject);
    };

    factory.editCard = function(cardContent, cardCategory, token) {
      var jsonObject = { cardContent: cardContent, cardCategory: cardCategory, token: token };
      return $http.put('/cards/' + card._id, jsonObject);
    }

    return factory;
  };

  kanbanFactory.$inject = ['$http'];

  angular.module('kanban-board').factory('kanbanFactory', kanbanFactory);

}());
