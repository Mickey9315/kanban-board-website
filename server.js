//Packages, models and configurations
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var router = express.Router();
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var Card = require("./models/card");
var User = require('./models/user'); // get our mongoose model

//Configuration
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('secret', config.secret); // secret variable
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
            expiresInMinutes: 1440 //expires in 24 hours
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
      console.log(newUser);
      newUser.save(function(err) {
        if (err) throw err;
        console.log('User saved successfully');
        res.json({ "success": true, "message": 'User registered successfully' });
      });
    } else if (user) { //If user exists
      res.json({ "success": false, "message": 'Registration failed. User already exists.' });
    }
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
  .get(function(req,res){ //Get specific card by ID
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
  .put(function(req,res){ //Update card by ID
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
  .delete(function(req,res){ //Remove card by ID
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
