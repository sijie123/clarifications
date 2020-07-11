const db = require('./db.js');
const errors = require('./error.js');
const {validationResult} = require('express-validator');
const strftime = require('./strftime.js');
const {publishMessage, publishThread} = require('../plugins/loader.js');
const adapters = require('../adapters/loader.js');

const validate = async (req, res, next) => {
  let errors = await validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

module.exports = {
  db: db,
  errors: errors,
  validate: validate,
  strftime: strftime,
  publishThread: publishThread,
  publishMessage: publishMessage,
  adapters: adapters,
  AuthService: adapters.AuthService
}