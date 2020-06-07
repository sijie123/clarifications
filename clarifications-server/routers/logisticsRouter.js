const express = require('express');
const { check, body, param, cookie } = require('express-validator');
const logisticsRouter = express.Router();
const { db, errors, auth, validate } = require('../util/common.js');

const authMiddleware = async (req, res, next) => {
  if (req.body.username && req.body.token) {
    auth.authenticateUserToken(req.body.username, req.body.token)
      .then(result => {
        if (result.role !== "CONTESTANT") throw new errors.AuthenticationError("Only contestants have access to this API. Committee/Volunteers: please get it yourself.");
        return result;
      })
      .then(auth => {req.auth = auth; next()})
      .catch(err => res.failure(err));
  } else {
    return res.failure(new errors.AuthenticationError("No usable authentication provided."));
  }
}

const canGrant = async (req, res, next) => {
  return db.one("SELECT 1 FROM users \
                 INNER JOIN usergroups USING (groupname) \
                 WHERE users.username = $1 \
                 AND role <> 'CONTESTANT'", [req.body.username])
    .then(exists => {
      next();
    }).catch(err => {
      console.log(err);
      return res.failure(new errors.ClientError("Contestants do not have access to this API."));
    })
}

logisticsRouter.post('/', authMiddleware, async (req, res) => {
  //Already authenticated
  db.one("SELECT array_agg(groupname) as groups FROM usergroups WHERE role <> 'CONTESTANT'")
  .then(res => {console.log(res); return res})
  .then(result => res.success(result))
  .catch(error => {console.log(error); res.failure(`${error}`)})
})

logisticsRouter.post('/:threadID/', [
  param('threadID').custom(threadID => {
    return db.one("SELECT 1 FROM threads WHERE id = $1", [threadID])
      .catch(err => {
        console.log(err);
        throw new Error("Thread doesn't exist!");
      })
  }),
  body('groupname').custom(groupname => {
    return db.one("SELECT 1 FROM usergroups WHERE groupname = $1", [groupname])
      .catch(err => {
        console.log(err);
        throw new Error("Group doesn't exist!");
      })
  })
], validate, authMiddleware, canGrant, async (req, res) => {
  //Already authenticated
  console.log(`Adding ${req.params.threadID} for ${req.body.groupname}`)
  db.oneOrNone("INSERT INTO threadsaccess(threadid, groupname) VALUES($1, $2) ON CONFLICT DO NOTHING;", [req.params.threadID, req.body.groupname])
  .then(result => res.success(result))
  .catch(error => {console.log(error); res.failure(`${error}`)})
})

module.exports = groupRouter;