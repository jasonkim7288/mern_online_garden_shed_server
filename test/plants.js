const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../server');
const agent = chai.request.agent(app);
const { expect } = chai;

chai.use(chaiHttp);

after(done => {
  agent.close();
  done();
});

describe('Test GET /api/plants', () => {
  it('should return the list of plants', done => {
    chai.request(app)
      .get('/api/plants?q=rose')
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body[0]).to.have.property('common_name');
        expect(res.body[0].common_name).to.not.be.null;
        expect(res.body[0]).to.have.property('scientific_name');
        expect(res.body[0]).to.have.property('family_common_name');
        expect(res.body[0]).to.have.property('image_url');
        done();
      })
  })
});
