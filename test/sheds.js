const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../server');
const agent = chai.request.agent(app);
const { expect } = chai;
var plantRecordData = require('./test_data/plantRecord.json');
var plantLogData = require('./test_data/plantLog.json');
const { signIn, signOut } = require('./test_lib');

chai.use(chaiHttp);

after(done => {
  agent.close();
  done();
});

// global variable to remember the path of default database
var shedId;
var plantRecordId;
var plantLogId;

// create two plant records and one plant log for the first plant record from the start
before(done => {
  agent.post('/api/auth/signin')
    .send({ access_token: process.env.GOOGLE_ACCESS_TOKEN })
    .end((err, res) =>{
      shedId = res.body.shed;
      agent.post(`/api/sheds/${shedId}/records`)
        .send(plantRecordData[1])
        .end((err, res) =>{
          agent.post(`/api/sheds/${shedId}/records`)
          .send(plantRecordData[0])
          .end((err, res) =>{
            plantRecordId = res.body._id;
            agent.post(`/api/sheds/${shedId}/records/${plantRecordId}/logs`)
              .send(plantLogData)
              .end((err, res) =>{
                plantLogId = res.body._id;
                console.log('res.body:', res.body);
                done();
              })
          });
        });
    });
})

describe('Test GET /api/sheds', () => {
  it('should return all sheds', done => {
    chai.request(app)
      .get('/api/sheds')
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(1);
        done();
      })
  })
});

describe('Test GET /api/sheds/:shedId', () => {
  it('should return shed info includinng all the plant records that belong to a shed', done => {
    chai.request(app)
      .get(`/api/sheds/${shedId}`)
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.plantRecords).to.be.an('array');
        expect(res.body.plantRecords.length).to.equal(2);
        // compare all the attributes with the local seed objects
        for (let i = 0; i< plantRecordData.length; i++) {
          expect(res.body.plantRecords[i].commonName).to.equal(plantRecordData[i].commonName);
          expect(res.body.plantRecords[i].scientificName).to.equal(plantRecordData[i].scientificName);
          expect(res.body.plantRecords[i].familyCommonName).to.equal(plantRecordData[i].familyCommonName);
          expect(res.body.plantRecords[i].description).to.equal(plantRecordData[i].description);
          expect(res.body.plantRecords[i].recordPhoto).to.equal(plantRecordData[i].recordPhoto);
        }
        done();
      })
  })
});

describe('Test GET /api/sheds/:shedId/records/:plantRecordId', () => {
  it('should return plant record info includinng all the plants logs that belong to a plant record', done => {
    chai.request(app)
      .get(`/api/sheds/${shedId}/records/${plantRecordId}`)
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        console.log('res.body:', res.body);
        expect(res.body.plantLogs).to.be.an('array');
        expect(res.body.plantLogs.length).to.equal(1);
        // compare all the attributes with the local seed object
        expect(res.body.plantLogs[0].notes).to.equal(plantLogData.notes);
        expect(res.body.plantLogs[0].mainPhotoIndex).to.equal(plantLogData.mainPhotoIndex);
        for (let i = 0; i < plantLogData.photos.length; i++) {
          expect(res.body.plantLogs[0].photos[i]).to.equal(plantLogData.photos[i]);
        }
        done();
      })
  })
});

describe('Test POST /api/sheds/:shedId/records', () => {
  before(done => {
    signIn(agent, expect, done);
  });

  after(done => {
    signOut(agent, expect, done);
  });

  it('should return created plant record', done => {
    const testPlantRecord = {
      commonName: "Rosemary",
      scientificName: "Rosmarinus officinalis",
      familyCommonName: "Mint family",
      description: "This is the third plant record",
      recordPhoto: "https://bs.floristic.org/image/o/4ac23eba5a0d5bb7c73e3ad8331614c7079dcfe0"
    }

    agent.post(`/api/sheds/${shedId}/records`)
      .send(testPlantRecord)
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.commonName).to.equal(testPlantRecord.commonName);
        expect(res.body.scientificName).to.equal(testPlantRecord.scientificName);
        expect(res.body.familyCommonName).to.equal(testPlantRecord.familyCommonName);
        expect(res.body.description).to.equal(testPlantRecord.description);
        expect(res.body.recordPhoto).to.equal(testPlantRecord.recordPhoto);
        done();
      });
  })
})

describe('Test POST /api/sheds/:shedId/records/:plantRecordId/logs', () => {
  before(done => {
    signIn(agent, expect, done);
  });

  after(done => {
    signOut(agent, expect, done);
  });

  it('should return created plant log', done => {
    const testPlantLog = {
      notes: "This is the notes",
      photos: [
        "https://placekitten.com/600/400",
        "https://placekitten.com/400/600",
        "https://placekitten.com/1024/768",
        "https://placekitten.com/768/1024",
        "https://placekitten.com/300/200",
      ],
      mainPhotoIndex: 3
    }

    agent.post(`/api/sheds/${shedId}/records/${plantRecordId}/logs`)
      .send(testPlantLog)
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.notes).to.equal(testPlantLog.notes);
        expect(res.body.mainPhotoIndex).to.equal(testPlantLog.mainPhotoIndex);
        for (let i = 0; i < testPlantLog.photos.length; i++) {
          expect(res.body.photos[i]).to.equal(testPlantLog.photos[i]);
        }
        done();
      });
  })
})