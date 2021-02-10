const express = require('express');
const router = require('express-promise-router')();
const PlantsController = require('../controllers/plants_controller');
const { validateQuery, schemas } = require('../helpers/route_helpers');

// get searched plant list
router.route('/')
  .get(validateQuery(schemas.plantSearchQuerySchema), 
    PlantsController.query);

module.exports = router;