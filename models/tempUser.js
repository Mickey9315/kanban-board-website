var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

//User schema. Defines the user params
var TempUserSchema = new Schema({
	username: { type: String, required: true, lowercase: true, index: { unique: true } },
	email: { type: String, required: true, index: { unique: true } },
	password: { type: String, required: true },
  GENERATED_VERIFYING_URL: String
});

module.exports = mongoose.model('tempUser', TempUserSchema);
