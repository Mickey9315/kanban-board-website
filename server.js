//Packages, models and configurations
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./models/user');
var Board = require('./models/board');
var Card = require('./models/card');

//Configuration
var port = process.env.PORT || 8080;
var IPAddress = '192.168.0.165';
mongoose.connect(config.database); //connect to database
app.set('secret', config.secret); //secret variable
app.use(morgan("dev")); //log the requests to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

/*===========================
          User API
============================*/

//login with existing user
router.post('/authenticate', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) { //If user does not exists
      res.json({ "success": false, "message": 'Authentication failed. User not found.' });
    } else if (user) { //If user exists
      //Check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (err) throw err;
        if(!isMatch) { //if password does not match
          res.json({ "success": false, "message": 'Authentication failed. Wrong password.' });
        } else {
          //if password is right, create a token
          var token = jwt.sign(user, app.get('secret'), {
            expiresIn: 86400 //expires in 24 hours
          });
          res.json({ "success": true, "message": 'Successfully authenticated',
          "token": token, "user": user });
        }
      });
    }
  });
});

//register a new user
router.post('/register', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) { //If user does not exists
      var newUser = new User({ username: req.body.username,
        email: req.body.email,
        password: req.body.password
      });
      if(newUser.username !== undefined && newUser.email !== undefined
        && newUser.password !== undefined) {
          newUser.save(function(err) { //Save the new user
            if (err) throw err;
            //If user is registered successfully, create a token
            var token = jwt.sign(user, app.get('secret'), {
              expiresIn: 86400 //expires in 24 hours
            });
            res.json({ "success": true, "message": 'User registered successfully',
            "token": token, "user": newUser });
          });
        }
        else {
          res.json({ "success": false, "message": 'User not valid' });
        }
    } else if (user) { //If user exists
      res.json({ "success": false, "message": 'Registration failed. User already exists.' });
    }
  });
});

//close the current session of the user (delete token on the client side)
router.post('/logout', function(req, res) {
  res.json({ "success": true, "message": 'User logout successfully' });
});

/*================================================
 route middleware to authenticate and check token
       All the requests below need token
=================================================*/
router.use(function(req, res, next) {
  //check header or post parameter for token
  var token = req.body.token || req.headers['x-access-token'];
  if (token) { //decode token
    //verifies secret and checks exp
    jwt.verify(token, app.get('secret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        //if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    //if there is no token, return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

//Get all registered users
router.get('/users', function(req, res) {
  User.find({}).populate('boards').exec(function(err, users) {
    if(err) {
      res.json({"success": false, "message": "Cant get users"});
    } else {
      res.json({"success": true, "message": users});
    }
  });
});

/*===========================
          Boards API
============================*/

//GET and POST
router.route("/boards")
  //Get all kanban boards for the user
  .get(function(req, res) {
    var userID = req.headers['x-user-id'];
    Board.find({owners: userID}, function(err, boards) {
      if(err) {
        res.json({"success": false, "message": "Error finding boards"});
      } else {
        res.json({"success": true, "message": boards});
      }
    });
  })
  //Create new board
  .post(function(req, res) {
    Board.create({
      name: req.body.name,
      description: req.body.description,
      owners: [ req.body.owner ]
     },
     function(err, createdBoard) {
       if(err) {
         res.json({"success": false, "message": "Error creating board"});
       } else {
         res.json({"success": true, "message": createdBoard});
       }
     });
   });

//GET, PUT and DELETE by ID
router.route('/boards/:id')
  //Get specific board by ID
  .get(function(req,res) {
    Board.findById(req.params.id, function(err, board) {
      if(err) {
        res.json({"success": false, "message": "Board not found"});
      } else {
        res.json({"success": true, "message": board});
      }
    });
  })
  //Update board by ID
  .put(function(req,res) {
    Board.findById(req.params.id, function(err, board) {
      if(err) {
        res.json({"success": false, "message": "Board not found"});
      } else {
        if(req.body.name !== undefined) {
          board.name = req.body.name; //Edit name
        }
        if(req.body.description !== undefined) {
          board.description = req.body.description; //Edit description
        }
        board.save(function(err, savedBoard) {
          if(err) {
            res.json({"success": false, "message": "Error saving board"});
          } else {
            res.json({"success": true, "message": savedBoard});
          }
        });
      }
    });
  })
  //Remove board by ID
  .delete(function(req,res) {
    //Find the board
    Board.findById(req.params.id, function(err, board) {
      if(err) {
        res.json({"success": false, "message": "Board not found"});
      } else {
        //Remove the board
        Board.remove({_id : req.params.id}, function(err) {
          if(err) {
            res.json({"success": false, "message": "Error removing board"});
          } else {
            //Remove all cards associated to the board ID
            Card.remove({board: req.params.id}, function(err) {
              if(err) {
                res.json({"success": false, "message": "Error removing board cards"});
              } else {
                res.json({"success": true, "message": "Board with id = " + req.params.id + " deleted"});
              }
            });
          }
        });
      }
    });
  });

/*===========================
          Cards API
============================*/
//GET and POST
router.route("/cards")
  //Get all cards for the board
  .get(function(req, res) {
    var boardID = req.headers['x-board-id'];
    Card.find({board: boardID}, function(err, cards) {
      if(err) {
        res.json({"success": false, "message": "Error finding cards"});
      } else {
        res.json({"success": true, "message": cards});
      }
    });
  })
  //Create new card
  .post(function(req, res) {
    var boardID = req.headers['x-board-id'];
    Card.create({
      content: req.body.content,
      category: req.body.category,
      board: boardID
     },
     function(err, createdCard) {
       if(err) {
         res.json({"success": false, "message": "Error creating card"});
       } else {
         res.json({"success": true, "message": createdCard});
       }
     });
   });

   //WORK IN PROGRESS...


//Start the server
app.use(express.static(__dirname + '/'), router);
app.listen(port, IPAddress);
console.log('Magic happens at http://' + IPAddress + ':' + port);
