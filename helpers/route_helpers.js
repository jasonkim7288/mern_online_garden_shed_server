const Joi = require('joi');

module.exports = {
  // validate params such as shedId, platnRecordId, logId, etc
  // they are all mongo db id
  validateParam: (schema, name) => {
    return (req, res, next) => {
      const result = schema.validate({
        param: req.params[name]
      })

      if (result.error) {
        return res.status(400).send(result.error);
      } else {
        if (!req.value) {
          req.value = {};
        }
        if (!req.value.params) {
          req.value.params = {};
        }
        req.value.params[name] = result.value.param;
        next();
      }
    }
  },
  // validate body using a schema
  validateBody: (schema) => {
    return (req, res, next) => {
      const result = schema.validate(req.body);
      if (result.error) {
        return res.status(400).send(result.error);
      }
      if (!req.value) {
        req.value = {};
      }
      req.value.body = result.value;
      next();
    }
  },
  // validate query based on the schema that is passed
  validateQuery: (schema) => {
    return (req, res, next) => {
      const result = schema.validate(req.query);
      if (result.error) {
        return res.status(400).send(result.error);
      }
      if (!req.value) {
        req.value = {};
      }
      req.value.query = result.value;
      next();
    }
  },
  schemas: {
    idSchema: Joi.object().keys({
      param: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    }),
    // search keywords for a plant must not exceed 100 characters
    plantSearchQuerySchema: Joi.object().keys({
      q: Joi.string().max(100)
    }),
    // there might not have scientific name and familly common name from trefle.io api
    createPlantRecordSchema: Joi.object().keys({
      commonName: Joi.string().max(100).required(),
      scientificName: Joi.string().allow('').max(100),
      familyCommonName: Joi.string().allow('').max(100),
      description: Joi.string().allow('').max(1000),
      recordPhoto: Joi.string().required()
    }),
    updatePlantRecordSchema: Joi.object().keys({
      description: Joi.string().allow('').max(1000),
    }),
    createPlantLogSchema: Joi.object().keys({
      notes: Joi.string().allow('').max(1000),
      photos: Joi.array().min(0).max(5),
      mainPhotoIndex: Joi.number().min(0).max(4)
    }),
    updatePlantLogSchema: Joi.object().keys({
      notes: Joi.string().allow('').max(1000),
      photos: Joi.array().min(0).max(5),
      mainPhotoIndex: Joi.number().min(0).max(4)
    })

  }
}