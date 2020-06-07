const express = require('express');
const { check, body, param, cookie } = require('express-validator');
const userRouter = express.Router();
const { db, errors, auth, validate } = require('../util/common.js');

const authMiddleware = async (req, res, next) => {
  if (req.body.username && req.body.token) {
    auth.authenticateUserToken(req.body.username, req.body.token)
      .then(result => {
        if (result.role === "CONTESTANT") throw new errors.AuthenticationError("Contestants do not have access to this API.");
        return result;
      })
      .then(auth => {req.auth = auth; next()})
      .catch(err => res.failure(err));
  } else {
    return res.failure(new errors.AuthenticationError("No usable authentication provided."));
  }
}

userRouter.post('/:query', authMiddleware, async (req, res) => {
  //Already authenticated
  console.log("Post received");
  if (req.params.query === undefined) req.params.query = '';
  db.query("SELECT username, groupname, displayname FROM users INNER JOIN usergroups USING (groupname) WHERE role = 'CONTESTANT' AND username LIKE $1", [`%${req.params.query}%`])
  .then(res => {console.log(res); return res})
  .then(result => res.success({users: result}))
  .catch(error => {console.log(error); res.failure(`${error}`)})
})

module.exports = userRouter;