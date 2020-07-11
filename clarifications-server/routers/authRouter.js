const express = require('express');
const { check, body, cookie } = require('express-validator');
const authRouter = express.Router();
const { adapters } = require('../util/common.js');

authRouter.post('/', async (req, res) => {
  if (!('AuthService' in adapters)) {
    return res.failure("No authentication methods available.", 403)
  }
  adapters['AuthService'].login(req)
  .then(token => res.cookie('auth', token).redirect('/login'))//.success({token: token}))
  .catch(err => {
    // Auth failed. Let's send the user a generic auth error.
    return res.redirect('/login?err=invalid_credentials');
//    return res.failure(new errors.AuthenticationError("Invalid username/password/token."));
  });
})

module.exports = authRouter;