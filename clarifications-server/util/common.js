const db = require('./db.js');
const errors = require('./error.js');
const auth = require('./auth.js');

const validate = async (req, res, next) => {
  let errors = await validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

module.exports = {
  db: db,
  errors: errors,
  auth: auth,
  validate: validate
}