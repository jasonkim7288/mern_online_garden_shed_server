const passport = require('passport');

module.exports = {
  // use only for getting user infomation
  // even if the authenticate is failed, it is not the error but just the fact that
  // the current user hasn't signed in yet
  ensureAuthenticated: (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        console.log('jwt err:', err);
        return next(err);
      }

      if (!user) {
        console.log('jwt user is null');
        return res.status(200).send();
      }

      console.log('jwt successfully signed');
      req.user = user;
      next();
    })(req, res, next);
  }
}