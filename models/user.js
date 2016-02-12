var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up the user model
module.exports = mongoose.model('user', new Schema({
	name: String,
	password: String
}));
