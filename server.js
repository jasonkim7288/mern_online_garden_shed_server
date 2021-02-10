const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require('path');

// load environment variables
console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'production') {
  const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
  require('dotenv').config({ path: envFile })
}

// activate passport
require('./config/passport')(passport);

// database connection
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  },
  err => {
    if (err) {
      console.log('err:', err);
    } else {
      console.log('MongoDB is connected');
    }
  }
)

const app = express();

// use morgan to console log each request
app.use(logger('dev'));

// CORS settings, currently the front end has two domains
const whiteList = ['http://localhost:3000', 'https://onlinegardenshed.netlify.app'];
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    // console.log('origin:', origin);
    if (whiteList.indexOf(origin) > -1 || process.env.NODE_ENV === 'test' || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// this makes heroku's express-session work
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  // set the proxy value true to make cookie work in chrome
  proxy: true,
  cookie: (process.env.NODE_ENV === 'production') ?
    { sameSite: 'none', secure: true, httpOnly: false} :
    { sameSite: false}
}));

app.use(passport.initialize());
app.use(passport.session());

// assign each route
app.use('/api/sheds', require('./routes/sheds_routes'));
app.use('/api/auth', require('./routes/auth_routes'));
app.use('/api/plants', require('./routes/plants_routes'));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => console.log(`Server is listening on ${port}`));

module.exports = { server, app };