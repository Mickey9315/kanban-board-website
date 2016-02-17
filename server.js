//Packages, models and configurations
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var router = express.Router();
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('./config');
var Card = require("./models/card");
var User = require('./models/user');

//Configuration
var port = process.env.PORT || 8080;
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
          res.json({ "success": true, "message": 'Successfully authenticated', "token": token });
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
        password: req.body.password });
      if(newUser.username !== undefined &&
        newUser.email !== undefined &&
        newUser.password !== undefined){
          newUser.save(function(err) { //Save the new user
            if (err) throw err;
            //If user is registered successfully, create a token
            var token = jwt.sign(user, app.get('secret'), {
              expiresIn: 86400 //expires in 24 hours
            });
            res.json({ "success": true, "message": 'User registered successfully', "token": token });
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
  User.find({}, function(err, users) {
    res.json(users);
  });
});

/*===========================
          Cards API
============================*/

//GET and POST
router.route("/cards")
  .get(function(req, res) { //Get all cards
    Card.find(function(err, cards) {
      if(err) {
        response = {"success": false, "message": "Error finding cards"};
        res.json(response);
      } else {
        response = {"success": true, "message": cards};
        res.json(response);
      }
    });
  })
  .post(function(req, res) { //Create new card
    Card.create({cardContent: req.body.cardContent, cardCategory: req.body.cardCategory},
      function(err, createdCard) {
        if(err) {
          response = {"success": false, "message": "Error creating card"};
          res.json(response);
        } else {
          response = {"success": true, "message": createdCard};
          res.json(response);
        }
      });
  });

//GET, PUT and DELETE by ID
router.route('/cards/:id')
  .get(function(req,res) { //Get specific card by ID
    Card.findById(req.params.id, function(err, card){
      if(err) {
        response = {"success": false, "message": "Card not found"};
        res.json(response);
      } else {
        response = {"success": true, "message": card};
        res.json(response);
      }
    });
  })
  .put(function(req,res) { //Update card by ID
    Card.findById(req.params.id, function(err, card){
      if(err) {
        response = {"success": false, "message": "Card not found"};
        res.json(response);
      } else {
        if(req.body.cardContent !== undefined) {
          card.cardContent = req.body.cardContent;
        }
        if(req.body.cardCategory !== undefined) {
          card.cardCategory = req.body.cardCategory;
        }
        card.save(function(err, savedCard){
          if(err) {
            response = {"success": false, "message": "Error saving card"};
            res.json(response);
          } else {
            response = {"success": true, "message": savedCard};
            res.json(response);
          }
        });
      }
    });
  })
  .delete(function(req,res) { //Remove card by ID
    Card.findById(req.params.id, function(err, card){
      if(err) {
        response = {"success": false, "message": "Card not found"};
        res.json(response);
      } else {
        Card.remove({_id : req.params.id},function(err){
          if(err) {
            response = {"success": false, "message": "Error removing card"};
            res.json(response);
          } else {
            response = {"success": true, "message": "Card with id = "+req.params.id+" deleted"};
            res.json(response);
          }
        });
      }
    });
  });

//Start the server
app.use(express.static(__dirname + '/'), router);
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
