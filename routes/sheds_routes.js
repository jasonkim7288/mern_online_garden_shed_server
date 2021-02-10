const express = require('express');
const passport = require('passport');
const router = require('express-promise-router')();
const { validateParam, validateBody, schemas } = require('../helpers/route_helpers');

const ShedsController = require('../controllers/sheds_controller');

// get all the sheds
router.route('/')
  .get(ShedsController.index);

// get the following sheds of the current user
router.route('/following-sheds')
.get(passport.authenticate('jwt', { session: false }),
  ShedsController.showFollowingSheds
);

// get the following plants records of the current user
router.route('/following-plant-records')
.get(passport.authenticate('jwt', { session: false }),
  ShedsController.showFollowingPlantRecords
);

// get a shed
router.route('/:shedId')
  .get(validateParam(schemas.idSchema, 'shedId'),
    ShedsController.showShed
  );

// create a new plant record
router.route('/:shedId/records')
  .post(passport.authenticate('jwt', { session: false }),
    validateParam(schemas.idSchema, 'shedId'),
    validateBody(schemas.createPlantRecordSchema),
    ShedsController.createPlantRecord
  );

router.route('/:shedId/records/:plantRecordId')
  // get a plant record
  .get(validateParam(schemas.idSchema, 'shedId'),
    validateParam(schemas.idSchema, 'plantRecordId'),
    ShedsController.showPlantRecord
  )
  // update a plant record
  .put(passport.authenticate('jwt', { session: false }),
    validateParam(schemas.idSchema, 'shedId'),
    validateParam(schemas.idSchema, 'plantRecordId'),
    validateBody(schemas.updatePlantRecordSchema),
    ShedsController.updatePlantRecord
  )
  // delete a plant record
  .delete(passport.authenticate('jwt', { session: false }),
    validateParam(schemas.idSchema, 'shedId'),
    validateParam(schemas.idSchema, 'plantRecordId'),
    ShedsController.removePlantRecord
  );

router.route('/:shedId/records/:plantRecordId/logs')
  // creaet a new plant log
  .post(passport.authenticate('jwt', { session: false }),
    validateParam(schemas.idSchema, 'shedId'),
    validateParam(schemas.idSchema, 'plantRecordId'),
    validateBody(schemas.createPlantLogSchema),
    ShedsController.createPlantLog
  );

router.route('/:shedId/records/:plantRecordId/logs/:logId')
  // get a plant log
  .get(validateParam(schemas.idSchema, 'shedId'),
    validateParam(schemas.idSchema, 'plantRecordId'),
    validateParam(schemas.idSchema, 'logId'),
    ShedsController.showLog
  )
  // update a plant log
  .put(passport.authenticate('jwt', { session: false }),
    validateParam(schemas.idSchema, 'shedId'),
    validateParam(schemas.idSchema, 'plantRecordId'),
    validateParam(schemas.idSchema, 'logId'),
    validateBody(schemas.updatePlantLogSchema),
    ShedsController.updatePlantLog
  )
  // delete a plant log
  .delete(passport.authenticate('jwt', { session: false }),
    validateParam(schemas.idSchema, 'shedId'),
    validateParam(schemas.idSchema, 'plantRecordId'),
    validateParam(schemas.idSchema, 'logId'),
    ShedsController.removePlantLog
  );

router.route('/:shedId/toggle-follow')
  // toggle following shed
  .get(passport.authenticate('jwt', { session: false }),
    validateParam(schemas.idSchema, 'shedId'),
    ShedsController.toggleFollowShed
  );

router.route('/:shedId/records/:plantRecordId/toggle-follow')
  // toggle following plant record
  .get(passport.authenticate('jwt', { session: false }),
    validateParam(schemas.idSchema, 'shedId'),
    validateParam(schemas.idSchema, 'plantRecordId'),
    ShedsController.toggleFollowRecord
  );

module.exports = router;