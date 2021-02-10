const express = require('express');
const passport = require('passport');
const router = require('express-promise-router')();
const { ensureAuthenticated } = require('../helpers/auth');

const AuthController = require('../controllers/auth_controller');

// sign in with access_token
router.route('/signin')
  .post(passport.authenticate('googleToken', { session: false }),
    AuthController.signIn
  );

// get user info after signing in
router.route('/userinfo')
  .get(ensureAuthenticated,
    AuthController.userinfo
  );

// sign out
router.route('/signout')
  .get(AuthController.signOut);

module.exports = router;