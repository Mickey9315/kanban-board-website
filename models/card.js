var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/kanbanDB');

// create instance of Schema
var mongoSchema = mongoose.Schema;

// create schema
var cardSchema = {
  "cardContent" : String,
  "cardCategory" : String
};

// create model if not exists.
module.exports = mongoose.model('card', cardSchema);
