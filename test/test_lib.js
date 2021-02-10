module.exports = {
  signIn: (agent, expect, testFunc) => {
    agent.post('/api/auth/signin')
      .send({ access_token: process.env.GOOGLE_ACCESS_TOKEN })
      .end((err, res) =>{
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('googleId');
        expect(res.body).to.have.property('email');
        expect(res.body).to.have.property('photo');
        expect(res.body).to.have.property('shed');
        testFunc();
      });
  },
  signOut: (agent, expect, testFunc) => {
    agent.get('/api/auth/signout')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        testFunc();
      });
  },
  sleep: (delay) => {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}
}