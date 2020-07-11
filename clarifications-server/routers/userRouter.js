const express = require('express');
const { check, body, param, cookie } = require('express-validator');
const userRouter = express.Router();
const { db, errors, validate } = require('../util/common.js');

const authMiddleware = async (req, res, next) => {
  if (req.auth.role === "CONTESTANT") return res.failure(new errors.AuthenticationError("Contestants do not have access to this API."));
  else next();
}

userRouter.post('/:query', authMiddleware, async (req, res) => {
  //Already authenticated
  if (req.params.query === undefined) req.params.query = '';
  db.query("SELECT username, groupname, displayname FROM users INNER JOIN usergroups USING (groupname) WHERE role = 'CONTESTANT' AND username LIKE $1", [`%${req.params.query}%`])
  .then(res => {console.log(res); return res})
  .then(result => res.success({users: result}))
  .catch(error => {console.log(error); res.failure(`${error}`)})
})

module.exports = userRouter;