const Shed = require('../models/shed');
const PlantRecord = require('../models/plant_record');
const User = require('../models/user');

// make the same format with Joi
const sendErrMsg = (code, res, msg) => res.status(code).send({ details: [{ message: msg }] });

module.exports = {
  // get all the sheds
  index: async (req, res) => {
    const sheds = await Shed.find()
      .populate({ path: 'plantRecords', options: { sort: { createdAt: 'desc' } } })
      .populate('owner');
    res.status(200).send(sheds);
  },
  // get a shed info
  showShed: async (req, res) => {
    console.log('req.value.params:', req.value.params);
    const foundShed = await Shed.findById(req.value.params.shedId)
      .populate({ path: 'plantRecords',
        populate: { path: 'ownedShed', populate: { path: 'owner' } },
        options: { sort: { createdAt: 'desc' } }
      })
      .populate('owner');
    if (foundShed) {
      res.status(200).send(foundShed);
    } else {
      sendErrMsg(400, res, 'Shed ID not found');
    }
  },
  // get a plant record
  showPlantRecord: async (req, res) => {
    console.log('req.value.params:', req.value.params);
    const { shedId, plantRecordId } = req.value.params;

    const foundPlantRecord = await PlantRecord.findById(plantRecordId)
      .populate({ path: 'ownedShed', populate: { path: 'owner' } })
      .lean();
    console.log('foundPlantRecord:', foundPlantRecord);
    if (foundPlantRecord) {
      if (foundPlantRecord.ownedShed._id == shedId) {
        res.status(200).send(foundPlantRecord);
      } else {
        sendErrMsg(400, res, 'Shed ID does not match');
      }
    } else {
      sendErrMsg(400, res, 'Plant Record ID not found');
    }
  },
  // get a plant log
  showLog: async (req, res) => {
    console.log('req.value.params:', req.value.params);
    const { shedId, plantRecordId, logId } = req.value.params;

    const foundPlantRecord = await PlantRecord.findById(plantRecordId)
      .populate({ path: 'ownedShed', populate: { path: 'owner' } })
      .lean();
    console.log('foundPlantRecord:', foundPlantRecord);
    
    // make sure all the params are handed over correctly
    if (foundPlantRecord) {
      if (foundPlantRecord.ownedShed._id == shedId) {
        if (foundPlantRecord.plantLogs) {
          const foundLog = foundPlantRecord.plantLogs.find(plantLog => plantLog._id == logId);
          if (foundLog) {
            res.status(200).send({
              email: foundPlantRecord.ownedShed.owner.email,
              record: foundPlantRecord.commonName,
              log: foundLog
            });
          } else {
            sendErrMsg(400, res, 'Plant Log ID not found');
          }
        } else {
          sendErrMsg(400, res, 'Plant Log ID not found');
        }
      } else {
        sendErrMsg(400, res, 'Shed ID does not match');
      }
    } else {
      sendErrMsg(400, res, 'Plant Record ID not found');
    }
  },
  // create a plant record
  createPlantRecord: async (req, res) => {
    console.log('req.value.params:', req.value.params);
    console.log('req.value.body:', req.value.body);
    const { shedId } = req.value.params;

    const foundShed = await Shed.findById(shedId)
      .populate('plantRecords');

    if (foundShed) {
      // make sure that current user owns the shed where the plant record is created
      if (String(req.user.shed) === String(foundShed._id)) {
        // create a new plant record
        let newPlantRecord = new PlantRecord(req.value.body);
        newPlantRecord.ownedShed = foundShed._id;
        // if there are duplicated common name, increase the record number
        newPlantRecord.recordNum = foundShed.plantRecords.reduce((acc, plantRecord) => {
          if (plantRecord.commonName === newPlantRecord.commonName) {
            if (plantRecord.recordNum >= acc) {
              acc = plantRecord.recordNum + 1;
            }
          }
          return acc;
        }, 1);
        const createdPlantRecord = await newPlantRecord.save();
        // link the plant record to shed
        console.log('createdPlantRecord:', createdPlantRecord);
        foundShed.plantRecords.unshift(createdPlantRecord);
        const updatedShed = await foundShed.save();
        res.status(200).send(createdPlantRecord);
      } else {
        sendErrMsg(401, res, 'Unauthorized');
      }
    } else {
      sendErrMsg(400, res, 'Shed ID not found');
    }
  },
  // create a plant log. plant log doesn't have it's own model, so save the plant record
  // where the plant log belongs to
  createPlantLog: async (req, res) => {
    console.log('request.value.params:', req.value.params);
    console.log('request.value.body:', req.value.body);
    const { shedId, plantRecordId } = req.value.params;

    const foundPlantRecord = await PlantRecord.findById(plantRecordId);
    if (foundPlantRecord) {
      // make sure the current user owns the shed where the plant log is created
      if (String(foundPlantRecord.ownedShed) === String(req.user.shed)) {
        if (String(foundPlantRecord.ownedShed) === shedId) {
          // create a new log
          let newPlantLog = {...req.value.body};
          // link the log to the plant record
          if (!foundPlantRecord.plantLogs) {
            foundPlantRecord.plantLogs = [];
          }
          // use unshift to be sorted by the descending order of creation date
          foundPlantRecord.plantLogs.unshift(newPlantLog);
          console.log('foundPlantRecord:', foundPlantRecord);
          const updatedPlantRecord = await foundPlantRecord.save();
          res.status(200).send(updatedPlantRecord.plantLogs[0]);
        } else {
          sendErrMsg(400, res, 'Shed ID does not match');
        }
      } else {
        sendErrMsg(401, res, 'Unauthorized');
      }
    } else {
      sendErrMsg(400, res, 'Plant Record ID not found');
    }
  },
  // update a plant record
  updatePlantRecord: async (req, res) => {
    console.log('req.value.params:', req.value.params);
    console.log('req.value.body:', req.value.body);
    const { shedId, plantRecordId } = req.value.params;

    const foundPlantRecord = await PlantRecord.findById(plantRecordId)
      .populate({ path: 'ownedShed', populate: { path: 'owner' } });
    if (foundPlantRecord) {
      console.log('foundPlantRecord.ownedShed._id:', foundPlantRecord.ownedShed._id);
      console.log('req.user.shed:', req.user.shed);
      // make sure that current user owns the shed where the plant record is updated
      if (String(foundPlantRecord.ownedShed._id) == String(req.user.shed)) {
        if (String(foundPlantRecord.ownedShed._id) === shedId) {
          Object.keys(req.value.body).forEach(key => foundPlantRecord[key] = req.value.body[key]);
          await foundPlantRecord.save();
          res.status(200).send(foundPlantRecord);
        } else {
          sendErrMsg(400, res, 'Shed ID does not match');
        }
      } else {
        sendErrMsg(401, res, 'Unauthorized');
      }
    } else {
      sendErrMsg(400, res, 'Plant Record ID not found');
    }
  },
  // update a plant log
  updatePlantLog: async (req, res) => {
    console.log('req.value.params:', req.value.params);
    console.log('req.value.body:', req.value.body);
    const { shedId, plantRecordId, logId } = req.value.params;

    const foundPlantRecord = await PlantRecord.findById(plantRecordId);
    if (foundPlantRecord) {
      // make sure the current user owns the shed where the plant log is updated
      if (String(foundPlantRecord.ownedShed) === String(req.user.shed)) {
        if (String(foundPlantRecord.ownedShed) === shedId) {
          const { plantLogs } = foundPlantRecord;
          if (plantLogs) {
            const foundPlantLog = plantLogs.find(plantLog => plantLog._id == logId);
            if (foundPlantLog) {
              Object.keys(req.value.body).forEach(key => foundPlantLog[key] = req.value.body[key]);
              await foundPlantRecord.save();
              res.status(200).send(foundPlantLog);
            } else {
              sendErrMsg(400, res, 'Plant Log ID not found');
            }
          } else {
            sendErrMsg(400, res, 'Plant logs are empty');
          }
        } else {
          sendErrMsg(400, res, 'Shed ID does not match');
        }
      } else {
        sendErrMsg(401, res, 'Unauthorized');
      }
    } else {
      sendErrMsg(400, res, 'Plant Record ID not found');
    }
  },
  // remove a plant record
  removePlantRecord: async (req, res) => {
    console.log('req.value.params:', req.value.params);
    const { shedId, plantRecordId } = req.value.params;

    await PlantRecord.findByIdAndDelete(plantRecordId);

    const foundShed = await Shed.findById(shedId);
    if (foundShed) {
      if (String(foundShed._id) === req.user.shed) {
        if (foundShed.plantRecords) {
          // exclude the plant record to delete fro the new array
          foundShed.plantRecords = foundShed.plantRecords.filter(plantRecord => plantRecord._id != plantRecordId);
          await foundShed.save();
        }
        res.status(200).send(foundShed);
      } else {
        sendErrMsg(401, res, 'Unauthorized');
      }
    } else {
      sendErrMsg(400, res, 'Shed ID does not match');
    }
  },
  // remove a plant log
  removePlantLog: async (req, res) => {
    console.log('req.value.params:', req.value.params);
    console.log('req.user:', req.user);
    const { shedId, plantRecordId, logId } = req.value.params;

    const foundPlantRecord = await PlantRecord.findById(plantRecordId)
      .populate({ path: 'ownedShed', populate: { path: 'owner' } });
    if (foundPlantRecord) {
      if (String(foundPlantRecord.ownedShed._id) === String(req.user.shed)) {
        if (String(foundPlantRecord.ownedShed._id) === shedId) {
          let { plantLogs } = foundPlantRecord;
          if (plantLogs) {
            foundPlantRecord.plantLogs = plantLogs.filter(plantLog => plantLog._id != logId);
            await foundPlantRecord.save();
            res.status(200).send(foundPlantRecord);
          } else {
            sendErrMsg(400, res, 'Plant logs are empty');
          }
        } else {
          sendErrMsg(400, res, 'Shed ID does not match');
        }
      } else {
        sendErrMsg(401, res, 'Unauthorized');
      }
    } else {
      sendErrMsg(400, res, 'Plant Record ID not found');
    }
  },
  // toggle the status of following a shed
  toggleFollowShed: async (req, res) => {
    console.log('req.value.params:', req.value.params);
    const { shedId } = req.value.params;

    const foundShed = await Shed.findById(shedId);
    if (foundShed) {
      console.log('req.user.followingSheds:', req.user.followingSheds);
      const foundUser = await User.findById(req.user.id);
      if (foundUser) {
        // if the current user already follows the shed, remove it
        // if not, add it to the list
        const foundIndex = foundUser.followingSheds.indexOf(shedId);
        if (foundIndex !== -1) {
          foundUser.followingSheds.splice(foundIndex, 1);
        } else {
          foundUser.followingSheds.push(shedId);
        }
        const updatedUser = await foundUser.save();
        res.status(200).send(updatedUser);
      } else {
        sendErrMsg(400, res, 'User ID not found');
      }
    } else {
      sendErrMsg(400, res, 'Shed ID does not match');
    }
  },
  // toggle the status of following a plant record
  toggleFollowRecord: async (req, res) => {
    console.log('req.value.params:', req.value.params);
    const { shedId, plantRecordId } = req.value.params;

    const foundPlantRecord = await PlantRecord.findById(plantRecordId);
    if (foundPlantRecord) {
      console.log('req.user.followingPlantRecords:', req.user.followingPlantRecords);
      const foundUser = await User.findById(req.user.id);
      if (foundUser) {
        // if the current user already follows the plant record, remove it
        // if not, add it to the list
        const foundIndex = foundUser.followingPlantRecords.indexOf(plantRecordId);
        if (foundIndex !== -1) {
          foundUser.followingPlantRecords.splice(foundIndex, 1);
        } else {
          foundUser.followingPlantRecords.push(plantRecordId);
        }
        const updatedUser = await foundUser.save();
        res.status(200).send(updatedUser);
      }
    } else {
      sendErrMsg(400, res, 'Plant Record ID not found');
    }
  },
  // list up all the sheds the current user is following
  showFollowingSheds: async (req, res) => {
    const foundUser = await User.findById(req.user.id)
      .populate({ path: 'followingSheds', populate: [{ path: 'owner' }, { path: 'plantRecords' }] });
    if (foundUser) {
      res.status(200).send(foundUser);
    } else {
      sendErrMsg(401, res, 'User not found');
    }
  },
  // list up all the plant records the current user is following
  showFollowingPlantRecords: async (req, res) => {
    const foundUser = await User.findById(req.user.id)
      .populate({ path: 'followingPlantRecords',
        populate: { path: 'ownedShed', populate: { path: 'owner' } },
        options: { sort: { createdAt: 'desc' } }
      });
    if (foundUser) {
      res.status(200).send(foundUser);
    } else {
      sendErrMsg(401, res, 'User not found');
    }
  }
}