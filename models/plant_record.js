const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// a plant record has many plant logs
// a shed has many plant records
const PlantRecordSchema = new Schema({
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  // if the user create a plant record which they already have, recordNum will
  // distinguish it from the previous one by having a unique number amongst them
  recordNum: {
    type: Number,
    required: true,
    default: 1
  },
  // commonName, scientificName and familyCommonName are all from the trefle.io api
  commonName: {
    type: String,
    required: true
  },
  scientificName: {
    type: String
  },
  familyCommonName: {
    type: String
  },
  // the user can store the summary of this plant
  description: {
    type: String,
  },
  recordPhoto: {
    type: String,
    required: true
  },
  // help the find the owner
  ownedShed: {
    type: Schema.Types.ObjectId,
    ref: 'sheds',
    required: true
  },
  plantLogs: [{
    createdAt: {
      type: Date,
      default: Date.now
    },
    photos: [String],
    mainPhotoIndex: Number,
    notes: String
  }]
});

module.exports = mongoose.model('plant_records', PlantRecordSchema);