const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// user schema store the google login info and following infomation
// user schema has also 1:1 relationship with shed schema, so when
// the user document is created, shed document is also created.
const UserSchema = new Schema({
  googleId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  photo: String,
  shed: {
    type: Schema.Types.ObjectId,
    ref: 'sheds'
  },
  followingSheds:[{
    type: Schema.Types.ObjectId,
    ref: 'sheds'
  }],
  followingPlantRecords:[{
    type: Schema.Types.ObjectId,
    ref: 'plant_records'
  }]
});

module.exports = mongoose.model('users', UserSchema); 