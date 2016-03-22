(function() {

  var kanbanController = function($scope, $mdSidenav, $log, $mdDialog, $mdToast,
    $location, $window, kanbanFactory, dragulaService) {

    //Boards array
    $scope.boards = [];
    //Cards arrays
    $scope.readyCards = [];
    $scope.inprogressCards = [];
    $scope.pausedCards = [];
    $scope.testingCards = [];
    $scope.doneCards = [];

    //Get all boards for the user
    $scope.getBoardsAndCards = function() {
      kanbanFactory.getBoards($window.sessionStorage.getItem('userID'),
      $window.sessionStorage.getItem('token'))
      .success(function(response) {
        if(response.success) {
          //Action after getting the boards
          angular.forEach(response.message, function(board){
            $scope.boards.push(board);
          });
          if($scope.boards.length !== 0) { //if the user owns any board
            $scope.getCards($scope.boards[0]);
            $scope.actualBoard = $scope.boards[0];
            $scope.toolbarTitle = $scope.boards[0].name;
          } else { //if not, creates one
            var jsonBoard = {
              name: 'My kanban board',
              description: 'This is your first kanban board!',
              owner: $window.sessionStorage.getItem('userID')
            };
            $scope.addBoard(jsonBoard);
            $scope.toolbarTitle = jsonBoard.name;
          }
        }
      })
    };

    //Check the new card category to save
    $scope.checkCategory = function(card) {
      if(card.category == 'ready')
        $scope.readyCards.push(card);
      if(card.category == 'inprogress')
        $scope.inprogressCards.push(card);
      if(card.category == 'paused')
        $scope.pausedCards.push(card);
      if(card.category == 'testing')
        $scope.testingCards.push(card);
      if(card.category == 'done')
        $scope.doneCards.push(card);
    };

    //Get the cards for a boards and show them using the factory
    $scope.getCards = function(board) {
      kanbanFactory.getCards(board._id, $window.sessionStorage.getItem('token'))
        .success(function(response) {
          //For every card, check the category to draw the board successfully
          angular.forEach(response.message, function(card){
            $scope.checkCategory(card);
          });
        })
    };

    //Create new card
    $scope.addCard = function(card) {
      kanbanFactory.createCard($scope.actualBoard._id, card, $window.sessionStorage.getItem('token'))
        .success(function(response) {
          //Action after creating the card
          $scope.checkCategory(response.message);
        });
    };

    //Edit card
    $scope.editCard = function(card) {
      kanbanFactory.editCard($scope.actualBoard._id, card, $window.sessionStorage.getItem('token'))
        .success(function(response) {
          //Action after editing card
        });
    };

    $scope.clearBoard = function() {
      //Clear cards arrays
      $scope.readyCards = [];
      $scope.inprogressCards = [];
      $scope.pausedCards = [];
      $scope.testingCards = [];
      $scope.doneCards = [];
    };

    //Displays all cards for the selected board
    $scope.switchBoard = function(board) {
      $scope.clearBoard();
      $scope.toolbarTitle = board.name; //set toolbar title
      $scope.actualBoard = board;
      $scope.getCards(board);
      $scope.toggleLeft();
    };

    //Creates new board
    $scope.addBoard = function(board) {
      kanbanFactory.createBoard(board, $window.sessionStorage.getItem('token'))
        .success(function(response) {
          $scope.boards.push(response.message);
        });
    }

    //Handles moving cards to different containers, and editing and saving them
    $scope.$on('first-bag.drop', function (e, el, container, source) {
      var card = el.scope().card;
      if(container.parent().hasClass('ready') == true) {
        card.category = 'ready';
      }
      if(container.parent().hasClass('inprogress') == true) {
        card.category = 'inprogress';
      }
      if(container.parent().hasClass('paused') == true) {
        card.category = 'paused';
      }
      if(container.parent().hasClass('testing') == true) {
        card.category = 'testing';
      }
      if(container.parent().hasClass('done') == true) {
        card.category = 'done';
      }
      $scope.editCard(card); //Edita la tarjeta y la guarda
    });

    $scope.$on('first-bag.over', function (e, el) {
    });

    //Left sidenav action
    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle().then(function(){
        //Action when toggle
      });
    };

    //logout function
    $scope.logoutDialog = function(ev) {
      var confirm = $mdDialog.confirm()
            .title('Logout')
            .textContent('Are you sure you want to close the session?')
            .ariaLabel('Logout')
            .targetEvent(ev)
            .ok('ok')
            .cancel('cancel');
      $mdDialog.show(confirm).then(function() {
        kanbanFactory.logout()
          .success(function(response) {
            //remove the user token and user ID from the sessionStorage
            $window.sessionStorage.removeItem('token');
            $window.sessionStorage.removeItem('userID');
            //go to login page
            $location.path('/login');
          });
      }, function() {
        //cancel
      });
    };

    //Use with newer angular-material versions (1.1.x)
    /*$scope.addNewCardDialog = function(ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.prompt()
            .title('Create new card')
            .textContent('Enter the description of your new card')
            .placeholder('description')
            .ariaLabel('Card description')
            .targetEvent(ev)
            .ok('save')
            .cancel('cancel');
      $mdDialog.show(confirm).then(function(result) {
        var card = { content: answer.description, category: 'ready' };
        if(card.content != '') {
          $scope.addCard(card); //Creates new card
        }
      }, function() {
        //Empty description - Doesn't create card
      });
    };*/

    //Show the dialog to create a new card
    $scope.addNewCardDialog = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'cardDialog.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
      .then(function(answer) {
        //Dialog accepted
        var card = { content: answer.description, category: 'ready' };
        if(card.content != '') {
          $scope.addCard(card); //Creates new card
        } else {
          $mdToast.show($mdToast.simple().textContent("Error: card is empty. Not created"));
        }
      }, function() {
        //Dialog cancelled
      });
    };

    //Show the dialog to create a new board
    $scope.addNewBoardDialog = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'boardDialog.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
      .then(function(answer) {
        //Dialog accepted
        var board = {
          name: answer.name,
          description: answer.description,
          owner: $window.sessionStorage.getItem('userID')
        };
        if(board.name != '' && board.description != '') {
          $scope.addBoard(board); //Creates new kanban board
        } else {
          $mdToast.show($mdToast.simple().textContent("Error: board is empty. Not created"));
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
    };

    //Get all user boards (and cards) when enter or refresh the application
    $scope.getBoardsAndCards();
  };

  kanbanController.$inject = ['$scope', '$mdSidenav', '$log', '$mdDialog', '$mdToast',
  '$location', '$window', 'kanbanFactory', 'dragulaService'];

  angular.module('kanban-board')
    .controller('kanbanController', kanbanController);

}());
