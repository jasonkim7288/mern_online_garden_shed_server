const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// shed schema and user schema have a 1 to 1 relationship
// a shed has many plant records
const ShedSchema = new Schema({
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  plantRecords: [{
    type: Schema.Types.ObjectId,
    ref: 'plant_records'
  }]
});

module.exports = mongoose.model('sheds', ShedSchema);