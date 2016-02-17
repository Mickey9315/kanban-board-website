var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up the card model (kanban task)
// every card below to an user
module.exports = mongoose.model('card', new Schema({
	cardContent: String,
	cardCategory: String,
	user: { type: Schema.Types.ObjectId, ref: 'user' }
}));
