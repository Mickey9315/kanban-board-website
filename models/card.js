var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CardSchema = new Schema({
	content: { type: String, required: true },
  category: { type: String },
	board: { type: Schema.Types.ObjectId, ref: 'board' }
});

module.exports = mongoose.model('card', CardSchema);
