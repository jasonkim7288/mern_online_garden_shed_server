process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { app } = require('../server');


chai.should();
chai.use(chaiHttp);

after(done => {
  mongoose.connection.db.dropDatabase(() => {
    done();
  });
});

describe('Auth API', () => {
  require('./auth');
});

describe('Sheds API', () => {
  require('./sheds');
});

describe('Plants API', () => {
  require('./plants');
});