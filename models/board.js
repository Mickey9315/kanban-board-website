var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up the kanban board model
// every kanban board below to an user
var BoardSchema = new Schema({
	name: { type: String },
  description: { type: String },
  cards: [ { type: Schema.Types.ObjectId, ref: 'card' } ],
  owners: [ { type: Schema.Types.ObjectId, ref: 'user' } ]
});

module.exports = mongoose.model('board', BoardSchema);
