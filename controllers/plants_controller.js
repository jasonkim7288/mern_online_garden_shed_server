const Plant = require('../models/plant');
const axios = require('axios');

module.exports = {
  // if the search keywords match in the database, return the data from it.
  // if not, use trefle.io api to get the data.
  // This is because trefle.io server is not stable
  query: async (req, res) => {
    const { q } = req.value.query;
    console.log('q:', q);
    const foundQuery = await Plant.findOne({queryStr: q})
    if (foundQuery) {
      res.status(200).send(foundQuery.plantsInfo);
    } else {
      try {
        const resTrefle = await axios.get(`https://trefle.io/api/v1/plants/search?token=${process.env.TREFLE_API_TOKEN}&q=${q}`);
        console.log('resTrefle:', resTrefle);
        let retData = {
          queryStr: q,
          plantsInfo: []
        };
        resTrefle.data.data.map(plant => {
          const { id, common_name, scientific_name, family_common_name, image_url } = plant;
          retData.plantsInfo.push({
            id,
            common_name,
            scientific_name,
            family_common_name,
            image_url
          })
        });
        const createdPlantList = await Plant.create(retData);
        console.log('createdPlantList:', createdPlantList);
        res.status(200).send(createdPlantList.plantsInfo);
      } catch (err) {
        console.log('err:', err);
        res.status(500).send(err.message);
      };
    }
  }
}