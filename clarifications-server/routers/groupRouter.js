const express = require('express');
const { check, body, param, cookie } = require('express-validator');
const groupRouter = express.Router();
const { db, errors, validate } = require('../util/common.js');

const authMiddleware = async (req, res, next) => {
  if (req.auth.role === "CONTESTANT") return res.failure(new errors.AuthenticationError("Contestants do not have access to this API."));
  else next();
}

groupRouter.post('/', authMiddleware, async (req, res) => {
  //Already authenticated
  db.one("SELECT array_agg(groupname) as groups FROM usergroups WHERE role <> 'CONTESTANT'")
  .then(result => res.success(result))
  .catch(error => {console.log(error); res.failure(`${error}`)})
})

groupRouter.post('/:threadID/', [
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
], validate, authMiddleware, async (req, res) => {
  //Already authenticated
  console.log(`Adding ${req.params.threadID} for ${req.body.groupname}`)
  db.oneOrNone("INSERT INTO threadsaccess(threadid, groupname) VALUES($1, $2) ON CONFLICT DO NOTHING;", [req.params.threadID, req.body.groupname])
  .then(result => res.success(result))
  .catch(error => {console.log(error); res.failure(`${error}`)})
})

module.exports = groupRouter;