(function() {

  var kanbanFactory = function($http) {
    var factory = {};

    factory.getBoards = function(userID, token) {
      return $http.get('/boards/owner/' + userID, { headers: {'x-access-token': token } });
    };

    factory.createBoard = function(board, token) {
      return $http.post('/boards', board, { headers: {'x-access-token': token } });
    };

    factory.getBoardByID = function(boardID, token) {
      return $http.get('/boards/' + boardID, { headers: {'x-access-token': token } });
    };

    factory.editBoard = function(boardID, token) {
      return $http.put('/boards/' + boardID, board, { headers: {'x-access-token': token } });
    };

    factory.removeBoard = function(boardID, token) {
      return $http.delete('/boards/' + boardID, { headers: {'x-access-token': token } });
    };

    factory.getCards = function(boardID, token) {
      return $http.get('/boards/' + boardID + '/cards', { headers: {'x-access-token': token } });
    };

    factory.createCard = function(boardID, card, token) {
      return $http.post('/boards/' + boardID + '/cards', card, { headers: {'x-access-token': token } });
    };

    factory.editCard = function(boardID, card, token) {
      return $http.put('/boards/' + boardID + '/cards/' + card._id, card, { headers: {'x-access-token': token } });
    };

    factory.deleteCard = function(boardID, card, token) {
      return $http.delete('/boards/' + boardID + '/cards/' + card._id, { headers: {'x-access-token': token } });
    };

    factory.logout = function() {
      return $http.post('/users/logout');
    };

    return factory;
  };

  kanbanFactory.$inject = ['$http'];

  angular.module('kanban-board').factory('kanbanFactory', kanbanFactory);

}());
