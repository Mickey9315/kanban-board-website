(function() {

  var kanbanController = function($scope, $mdSidenav, $log, $mdDialog, $mdToast,
    $location, $window, $interval, kanbanFactory, dragulaService) {

    //Boards array
    $scope.boards = [];
    //Cards arrays for every category
    $scope.readyCards = [];
    $scope.inprogressCards = [];
    $scope.pausedCards = [];
    $scope.testingCards = [];
    $scope.doneCards = [];

    //FAB speed dial options
    this.isOpen = false;
    this.selectedMode = 'md-fling';
    this.selectedDirection = 'up';

    //Username and email
    this.username = $window.sessionStorage.getItem('username');
    this.email = $window.sessionStorage.getItem('email');

    //Error dialog
    $scope.showAlert = function() {
    $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(false)
        .title('Error')
        .textContent('There is a network error. Check your connection.')
        .ariaLabel('Error dialog')
        .ok('Ok')
      );
    };

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
      .error(function(response, status) {
        $scope.showAlert();
      });
    };

    //Check the new card category to save
    $scope.checkCategory = function(card) {
      switch (card.category) {
        case 'ready':
          $scope.readyCards.push(card);
          break;
        case 'inprogress':
          $scope.inprogressCards.push(card);
          break;
        case 'paused':
          $scope.pausedCards.push(card);
          break;
        case 'testing':
          $scope.testingCards.push(card);
          break;
        case 'done':
          $scope.doneCards.push(card);
          break;
      }
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
        .error(function(response, status) {
          $scope.showAlert();
        });
    };

    //Create new card
    $scope.addCard = function(card) {
      kanbanFactory.createCard($scope.actualBoard._id, card, $window.sessionStorage.getItem('token'))
        .success(function(response) {
          //Action after creating the card
          $scope.checkCategory(response.message);
        })
        .error(function(response, status) {
          $scope.showAlert();
        });
    };

    //Edit card
    $scope.editCard = function(card) {
      kanbanFactory.editCard($scope.actualBoard._id, card, $window.sessionStorage.getItem('token'))
        .success(function(response) {
          //Action after editing card
        })
        .error(function(response, status) {
          $scope.showAlert();
        });;
    };

    //Delete card
    $scope.deleteCard = function(index, card) {
      kanbanFactory.deleteCard($scope.actualBoard._id, card, $window.sessionStorage.getItem('token'))
        .success(function(response) {
          if(card.category == 'ready')
            $scope.readyCards.splice(index, 1);
          else if(card.category == 'inprogress')
            $scope.inprogressCards.splice(index, 1);
          else if(card.category == 'paused')
            $scope.pausedCards.splice(index, 1);
          else if(card.category == 'testing')
            $scope.testingCards.splice(index, 1);
          else if(card.category == 'done')
            $scope.doneCards.splice(index, 1);
        })
        .error(function(response, status) {
          $scope.showAlert();
        });;
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
        })
        .error(function(response, status) {
          $scope.showAlert();
        });;
    };

    //Edit board
    $scope.editBoard = function(board) {
      kanbanFactory.editBoard(board, $window.sessionStorage.getItem('token'))
        .success(function(response) {
          //Action after editing board
        })
        .error(function(response, status) {
          $scope.showAlert();
        });;
    };

    //Delete board
    $scope.deleteBoard = function(index, board) {
      kanbanFactory.deleteBoard(board._id, $window.sessionStorage.getItem('token'))
        .success(function(response) {
            if($scope.boards.length !== 0) {
              $scope.boards.splice(index, 1);
              $scope.clearBoard();
              $scope.getCards($scope.boards[0]);
              $scope.actualBoard = $scope.boards[0];
              $scope.toolbarTitle = $scope.boards[0].name;
              $scope.toggleLeft();
          }
        })
        .error(function(response, status) {
          $scope.showAlert();
        });;
    };

    $scope.$on('first-bag.drag', function (e, el, container, source) {
      $scope.dragging = true;
    });

    //Handles moving cards to different containers, and editing and saving them
    $scope.$on('first-bag.drop', function (e, el, container, source) {
      $scope.dragging = false;
      var card = el.scope().card;
      if(container.parent().hasClass('ready') == true) {
        card.category = 'ready';
      }
      else if(container.parent().hasClass('inprogress') == true) {
        card.category = 'inprogress';
      }
      else if(container.parent().hasClass('paused') == true) {
        card.category = 'paused';
      }
      else if(container.parent().hasClass('testing') == true) {
        card.category = 'testing';
      }
      else if(container.parent().hasClass('done') == true) {
        card.category = 'done';
      }
      $scope.editCard(card); //Edita la tarjeta y la guarda
    });

    //Left sidenav action
    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle().then(function(){
        //Action when toggle
      });
    };

    //logout function
    $scope.logoutDialog = function(ev) {
      var dialog = $mdDialog.confirm()
            .title('Close session')
            .textContent('Are you sure you want to close the session?')
            .ariaLabel('Logout')
            .targetEvent(ev)
            .ok('ok')
            .cancel('cancel');
      $mdDialog.show(dialog).then(function() {
        kanbanFactory.logout()
          .success(function(response) {
            //remove the user token and user ID from the sessionStorage
            $window.sessionStorage.removeItem('token');
            $window.sessionStorage.removeItem('userID');
            //go to login page
            $location.path('/login');
          })
          .error(function(response, status) {
            $scope.showAlert();
          });;
      }, function() {
        //cancel
      });
    };

    //Show the dialog to create a new card
    $scope.addNewCardDialog = function(ev) {
      var dialog = $mdDialog.prompt()
            .title('Create new card')
            .textContent('Enter the description')
            .placeholder('description')
            .ariaLabel('Card description')
            .targetEvent(ev)
            .ok('save')
            .cancel('cancel');
      $mdDialog.show(dialog).then(function(result) {
        var card = { content: result, category: 'ready' };
        if(card.content != '' && card.content != undefined) {
          $scope.addCard(card); //Creates new card
        } else {
          $mdToast.show($mdToast.simple().textContent("Card was not created"));
        }
      }, function() {
        //Empty description - Doesn't create card
        $mdToast.show($mdToast.simple().textContent("Card was not created"));
      });
    };

    //Show the dialog to edit a card
    $scope.editCardDialog = function(ev, index, card) {
      var dialog = $mdDialog.prompt()
            .title('Edit card')
            .placeholder('description')
            .initialValue(card.content)
            .ariaLabel('Card description')
            .targetEvent(ev)
            .ok('save')
            .cancel('cancel');
      $mdDialog.show(dialog).then(function(result) {
        if(result != '' && result != undefined) {
          card.content = result;
          $scope.editCard(card); //Edit card
        } else {
          $mdToast.show($mdToast.simple().textContent("Card was not edited"));
        }
      }, function() {
        //Empty description - Doesn't create card
        $mdToast.show($mdToast.simple().textContent("Card was not edited"));
      });
    };

    //Delete card in $scope array and in database
    $scope.deleteCardDialog = function(index, card) {
      var dialog = $mdDialog.confirm()
            .title('Delete card')
            .textContent('Are you sure you want to delete this card?')
            .ariaLabel('Delete card')
            .ok('ok')
            .cancel('cancel');
      $mdDialog.show(dialog).then(function() {
        $scope.deleteCard(index, card);
      }, function() {
        //cancel
      });
    };

    //Show the dialog to create a new board
    $scope.addNewBoardDialog = function(ev) {
      var board = { owner: $window.sessionStorage.getItem('userID') };
      var boardTitleDialog = $mdDialog.prompt()
            .title('Board title')
            .placeholder('title')
            .ariaLabel('Board title')
            .targetEvent(ev)
            .ok('next')
            .cancel('cancel');
      var boardDescriptionDialog = $mdDialog.prompt()
            .title('Board description')
            .placeholder('description')
            .ariaLabel('Board description')
            .targetEvent(ev)
            .ok('save')
            .cancel('cancel');
      //Show board title dialog
      $mdDialog.show(boardTitleDialog).then(function(resultTitle) {
        if(resultTitle != '' && resultTitle != undefined) {
          //Show board description dialog
          $mdDialog.show(boardDescriptionDialog).then(function(resultDescription) {
            if(resultDescription != '' && resultDescription != undefined) {
              //Save board
              board.name = resultTitle;
              board.description = resultDescription;
              $scope.addBoard(board);
            } else {
              $mdToast.show($mdToast.simple().textContent("Board was not created"));
            }
          }, function() {
            $mdToast.show($mdToast.simple().textContent("Board was not created"));
          });
        } else {
          $mdToast.show($mdToast.simple().textContent("Board was not created"));
        }
      }, function() {
        $mdToast.show($mdToast.simple().textContent("Board was not created"));
      });
    };

    //Edit board name dialog
    $scope.editBoardNameDialog = function(ev, index, board) {
      var dialog = $mdDialog.prompt()
            .title('Edit board name')
            .placeholder('board name')
            .initialValue(board.name)
            .ariaLabel('Board name')
            .targetEvent(ev)
            .ok('save')
            .cancel('cancel');
      $mdDialog.show(dialog).then(function(result) {
        if(result != '' && result != undefined) {
          board.name = result;
          $scope.editBoard(board); //Edit card
        } else {
          $mdToast.show($mdToast.simple().textContent("Board was not edited"));
        }
      }, function() {
        //Empty description - Doesn't create card
        $mdToast.show($mdToast.simple().textContent("Board was not edited"));
      });
    };

    //Edit board description dialog
    $scope.editBoardDescriptionDialog = function(ev, index, board) {
      var dialog = $mdDialog.prompt()
            .title('Edit board description')
            .placeholder('board description')
            .initialValue(board.description)
            .ariaLabel('Board description')
            .targetEvent(ev)
            .ok('save')
            .cancel('cancel');
      $mdDialog.show(dialog).then(function(result) {
        if(result != '' && result != undefined) {
          board.description = result;
          $scope.editBoard(board); //Edit card
        } else {
          $mdToast.show($mdToast.simple().textContent("Board was not edited"));
        }
      }, function() {
        //Empty description - Doesn't create card
        $mdToast.show($mdToast.simple().textContent("Board was not edited"));
      });
    };

    //Delete board dialog
    $scope.deleteBoardDialog = function(index, board) {
      var dialog = $mdDialog.confirm()
            .title('Delete board')
            .textContent('Are you sure you want to delete this board? All associated cards will be deleted')
            .ariaLabel('Delete board')
            .ok('ok')
            .cancel('cancel');
      $mdDialog.show(dialog).then(function() {
        $scope.deleteBoard(index, board);
        }, function() {
          //cancel
        });
    };

    //Get all user boards (and cards) when enter or refresh the application
    $scope.getBoardsAndCards();
  };

  kanbanController.$inject = ['$scope', '$mdSidenav', '$log', '$mdDialog', '$mdToast',
  '$location', '$window', '$interval', 'kanbanFactory', 'dragulaService'];

  angular.module('kanban-board')
    .controller('kanbanController', kanbanController);

}());
