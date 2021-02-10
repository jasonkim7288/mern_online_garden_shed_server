const JWT = require('jsonwebtoken');
const User = require('../models/user');

// signing googleId of the user
const signToken = user => {
  return JWT.sign({
    iss: 'ThomasNJason',
    sub: user.googleId,
  }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

module.exports = {
  // sign googleId using JWT and store access_token into the session
  signIn: async (req, res) => {
    console.log('signIn called');
    const token = signToken(req.user);
    req.session.access_token = token;
    res.status(200).send(req.user);
  },
  // return the user information
  userinfo: async (req, res) => {
    console.log('userInfo called');
    const foundUser = await User.findById(req.user.id)
    
    if (foundUser) {
      res.status(200).send(foundUser);
    } else {
      res.status(200).send(null);
    }
  },
  // sign out by logging out from passport and clearing cookie and session
  signOut: async (req, res) => {
    console.log('signOut called');
    req.logout();
    res.clearCookie('connect.sid');
    req.session.access_token = null;
    req.session.destroy();
    res.status(200).send({ msg: 'signed out' });
  }
}