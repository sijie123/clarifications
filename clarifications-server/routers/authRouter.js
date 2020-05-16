const express = require('express');
const { check, body, cookie } = require('express-validator');
const authRouter = express.Router();
const { db, errors, auth, validate } = require('../util/common.js');

authRouter.post('/', async (req, res) => {
  auth.authenticateUserPass(req.body.username, req.body.password)
    .then(result => res.success(result))
    .catch(err => {console.log(err); res.failure(err)})
})

module.exports = authRouter;