var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up the card model (kanban task)
module.exports = mongoose.model('card', new Schema({
	cardContent: String,
	cardCategory: String
}));
