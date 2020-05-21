const db = require('./db.js');
const errors = require('./error.js');
const auth = require('./auth.js');
const {validationResult} = require('express-validator');
const strftime = require('./strftime.js');

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
  auth: auth,
  validate: validate,
  strftime: strftime
}