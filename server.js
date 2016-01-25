var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var router = express.Router();
var mongoCard = require("./models/card");
var morgan = require('morgan');

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

//GET and POST
router.route("/cards")
  .get(function(req, res) { //Get all cards
    mongoCard.find(function(err, cards) {
      if(err) {
        response = {"error" : true, "message" : "Error finding cards"};
        res.json(response);
      } else {
        response = {"error" : false, "message" : cards};
        res.json(response);
      }
    });
  })
  .post(function(req, res) { //Create new card
    mongoCard.create({cardContent: req.body.cardContent, cardCategory: req.body.cardCategory},
      function(err, createdCard) {
        if(err) {
          response = {"error" : true, "message" : "Error creating card"};
          res.json(response);
        } else {
          response = {"error" : false, "message" : createdCard};
          res.json(response);
        }
      });
  });

//GET, PUT and DELETE
router.route('/cards/:id')
  .get(function(req,res){ //Get specific card by ID
    mongoCard.findById(req.params.id, function(err, card){
      if(err) {
        response = {"error" : true, "message" : "Card not found"};
        res.json(response);
      } else {
        response = {"error" : false, "message" : card};
        res.json(response);
      }
    });
  })
  .put(function(req,res){ //Update card by ID
    mongoCard.findById(req.params.id, function(err, card){
      if(err) {
        response = {"error" : true, "message" : "Card not found"};
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
            response = {"error" : true, "message" : "Error saving card"};
            res.json(response);
          } else {
            response = {"error" : false, "message" : savedCard};
            res.json(response);
          }
        })
      }
    });
  })
  .delete(function(req,res){ //Remove card by ID
    mongoCard.findById(req.params.id, function(err, card){
      if(err) {
        response = {"error" : true, "message" : "Card not found"};
        res.json(response);
      } else {
        mongoCard.remove({_id : req.params.id},function(err){
          if(err) {
            response = {"error" : true, "message" : "Error removing card"};
            res.json(response);
          } else {
            response = {"error" : false, "message" : "Card with id = "+req.params.id+" deleted"};
            res.json(response);
          }
        });
      }
    });
  });

app.use(express.static(__dirname + '/'), router);
app.listen(8080);

console.log('Magic happens on port 8080');
