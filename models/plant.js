const mongoose = require('mongoose');
const Schema =mongoose.Schema;

// plant schema is the data from trefle.io api
const PlantSchema = new Schema({
  queryStr: {
    type: String,
  },
  plantsInfo: [{
    id: Number,
    common_name: String,
    scientific_name: String,
    family_common_name: String,
    image_url: String
  }]
});

module.exports = mongoose.model('plants', PlantSchema);