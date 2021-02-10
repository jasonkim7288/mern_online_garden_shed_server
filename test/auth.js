const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../server');
const agent = chai.request.agent(app);
const { expect } = chai;
const { signIn, signOut } = require('./test_lib');

chai.use(chaiHttp);

// to test Google OAuth
// 1. visit https://developers.google.com/oauthplayground
// 2. unfold 'Google OAuth2 API v2
// 3. check https://www.googleapis.com/auth/userinfo.email
// 4. check https://www.googleapis.com/auth/userinfo.profile
// 5. hit the button 'Authorize APIs'
// 6. select the Google Account you want to test
// 7. hit the button 'Exchange authorization code for tokens
// 8. Go back to the Step 2
// 9. copy Access token and paste it into '.env.test' file with the key 'GOOGLE_ACCESS_TOKEN'
// 10. keep it mind that this access token is valid for only 1 hour.

after(done => {
  agent.close();
  done();
});

describe('Test POST /api/auth/signin', () => {
  beforeEach(done => {
    signOut(agent, expect, done);
  });

  it('should sign in and return user info with a valid access token', done => {
    signIn(agent, expect, done);
  });

  it('should return error for an invalid access token', done => {
    agent.post('/api/auth/signin')
      .send({ access_token: 'dsfasadfe98388hsf8hdsafjewf' })
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
  });

  it('should return error without an access token', done => {
    agent.post('/api/auth/signin')
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe('Test GET /api/auth/userinfo', () => {
  beforeEach(done => {
    signOut(agent, expect, done);
  });

  it('should return user info after signing in', done => {
    const testFunc = () => {
      agent.get('/api/auth/userinfo')
        .end((err, res) =>{
          console.log('res:', res.request.cookies);
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('googleId');
          expect(res.body).to.have.property('email');
          expect(res.body).to.have.property('photo');
          expect(res.body).to.have.property('shed');
          done();
        });
    };
    signIn(agent, expect, testFunc);
  });

  it('should return null user info without signing in', done => {
    agent.get('/api/auth/userinfo')
      .end((err, res) =>{
        console.log('res:', res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
        done();
      });
  });
});

describe('Test GET /api/auth/signout', () => {
  it('should sign out even if the user has not signed in', done => {
    signOut(agent, expect, done);
  });

  it('should sign out after signed in', done => {
    signIn(agent, expect, () => {signOut(agent, expect, done);});
  });
});