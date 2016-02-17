(function() {

  var kanbanController = function($scope, $mdSidenav, $log, $mdDialog, $mdToast,
    $location, $window, kanbanFactory, dragulaService) {

    //Card arrays
    $scope.readyCards = [];
    $scope.inprogressCards = [];
    $scope.pausedCards = [];
    $scope.testingCards = [];
    $scope.doneCards = [];

    //Check the new card category to save
    $scope.checkCategory = function(card) {
      if(card.cardCategory == 'ready')
        $scope.readyCards.push(card);
      if(card.cardCategory == 'inprogress')
        $scope.inprogressCards.push(card);
      if(card.cardCategory == 'paused')
        $scope.pausedCards.push(card);
      if(card.cardCategory == 'testing')
        $scope.testingCards.push(card);
      if(card.cardCategory == 'done')
        $scope.doneCards.push(card);
    };

    //Get the cards and show them using the factory
    $scope.getCards = function() {
      kanbanFactory.getCards($window.sessionStorage.getItem('token'))
        .success(function(response) {
          angular.forEach(response.message, function(card){
            //Action after getting the cards
            $scope.checkCategory(card);
          });
        })
    };

    //Create new card
    $scope.addCard = function(card) {
      kanbanFactory.createCard(card, $window.sessionStorage.getItem('token'))
        .success(function(response) {
          //Action after creating the card
          $scope.checkCategory(response.message);
        });
    };

    //Edit card
    $scope.editCard = function(card) {
      kanbanFactory.editCard(card, $window.sessionStorage.getItem('token'))
        .success(function(response) {
          //Action after editing card
        });
    };

    //Handles moving cards to different containers, and editing and saving them
    $scope.$on('first-bag.drop', function (e, el, container, source) {
      var card = el.scope().card;
      if(container.parent().hasClass('ready') == true) {
        card.cardCategory = 'ready';
      }
      if(container.parent().hasClass('inprogress') == true) {
        card.cardCategory = 'inprogress';
      }
      if(container.parent().hasClass('paused') == true) {
        card.cardCategory = 'paused';
      }
      if(container.parent().hasClass('testing') == true) {
        card.cardCategory = 'testing';
      }
      if(container.parent().hasClass('done') == true) {
        card.cardCategory = 'done';
      }
      $scope.editCard(card); //Edita la tarjeta y la guarda
    });

    //Left sidenav action
    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle().then(function(){
        //Action when toggle
      });
    };

    //Logout and go back to login screen
    $scope.logout = function() {
      kanbanFactory.logout()
        .success(function(response) {
          //remove the user token from the sessionStorage
          $window.sessionStorage.removeItem('token');
          //go to login page
          $location.path('/login');
        });
    }

    //Show the dialog to create a new card
    $scope.AddNewCardDialog = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'dialog1.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
      .then(function(answer) {
        //Dialog accepted
        var card = { cardContent: answer.description, cardCategory: 'ready' };
        if(card.cardContent != '') {
          $scope.addCard(card); //Creates new card
        }
      }, function() {
        //Dialog cancelled
      });
    };

    //Dialog controller
    function DialogController($scope, $mdDialog) {
      $scope.inputDialog = { description: '', category: '' };
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.answer = function(answer) {
        $mdDialog.hide($scope.inputDialog);
      };
    }

    $scope.getCards(); //Get all cards when you enter or refresh the application
  };

  kanbanController.$inject = ['$scope', '$mdSidenav', '$log', '$mdDialog', '$mdToast',
  '$location', '$window', 'kanbanFactory', 'dragulaService'];

  angular.module('kanban-board')
    .controller('kanbanController', kanbanController);

}());
