const passport = require('passport');
const GooglePlusTokenStrategy = require('passport-google-token').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const User = require('../models/user');
const Shed = require('../models/shed');

// get the access_token from the session based on the cookie's session id
const cookieExtractor = req => {
  let token = null;
  if (req && req.session) {
    token = req.session.access_token;
  }
  return token;
}

module.exports = passport => {
  // use JWT strategy to authorize 
  passport.use('jwt', new JwtStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET
  }, async (payload, done) => {
    try {
      const foundUser = await User.findOne({ googleId: payload.sub });
      if (foundUser) {
        console.log('User found');
        return done(null, foundUser);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  }));

  // googleToken strategy is for getting access_toke value from the front end,
  // getting the google user info from the google server and creating a user model if not exists
  passport.use('googleToken', new GooglePlusTokenStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }, async (accessToken, refreshToken, profile, done) => {
    // console.log('accessToken:', accessToken);
    // console.log('refreshToken:', refreshToken);
    // console.log('profile:', profile);
    try {
      const foundUser = await User.findOne({ googleId: profile.id})
      if (foundUser) {
        console.log('User already exists');
        return done(null, foundUser);
      } else {
        const photoUrl = profile.photos ? profile.photos[0].value : profile._json.picture;
        const newUser = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          photo: photoUrl,
          followingSheds: [],
          followingPlantRecords: []
        });
        const newShed = await Shed.create({
          owner: newUser._id,
          plantRecords: []
        });
        newUser.shed = newShed._id;
        await newUser.save();
        return done(null, newUser);
      }
    } catch(error) {
      console.log('error.message:', error.message);
      return done(error, false, error.message);
    }
  }));
}