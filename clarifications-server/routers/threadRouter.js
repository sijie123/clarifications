const express = require('express');
const { check, body, param, cookie } = require('express-validator');
const threadRouter = express.Router();
const { db, errors, auth, validate } = require('../util/common.js');

const authMiddleware = async (req, res, next) => {
  if (req.body.username && req.body.password) {
    auth.authenticateUserPass(req.body.username, req.body.password)
      .then(auth => {req.auth = auth; next()})
      .catch(err => res.failure(err));
  } else if (req.body.username && req.body.token) {
    auth.authenticateUserToken(req.body.username, req.body.token)
      .then(auth => {req.auth = auth; next()})
      .catch(err => res.failure(err));
  } else {
    return res.failure(new errors.AuthenticationError("No usable authentication provided."));
  }
}

const truncate = (input) => {
  if (input.length <= 100) return input;
  return input.slice(0, 97) + "..."; 
}
threadRouter.post('/:threadID/', [
  body('content').exists().notEmpty(),
  param('threadID').custom(threadID => {
    return db.one("SELECT 1 FROM threads WHERE id = $1", [threadID])
      .catch(err => {
        console.log(err);
        throw new Error("Thread doesn't exist!");
      })
  })
], validate, authMiddleware, async (req, res) => {
  //Already authenticated
  if (req.body.isExternal === undefined) req.body.isExternal = true;
  db.one("INSERT INTO messages(threadID, contents, contentType, creatorID, isExternal) VALUES($1, $2, $3, $4, $5) RETURNING id", [req.params.threadID, req.body.content, 'text', req.body.username, req.body.isExternal])
  .then(result => res.success({
    threadID: req.params.threadID,
    messageID: result["id"]
  }))
  .catch(error => {console.log(error); res.failure(`${error}`)})
})

/* Message format: 
  {
    username: String,
    token: String,
    subject: String,
    Content: String
  }
  */
threadRouter.post('/', [
  body('subject').exists().notEmpty(),
  body('content').exists().notEmpty(),
], validate, authMiddleware, async (req, res) => {
  //Already authenticated
  if (req.body.isExternal === undefined) req.body.isExternal = true;
  db.tx(async t => {
    let result = await t.one("INSERT INTO threads (subject, title, status, contestantID) VALUES ($1, $2, $3, $4) RETURNING id", [req.body.subject, truncate(req.body.content), 'Awaiting Answer', req.body.username])
    let threadID = result['id']

    //This step will be done by human dispatcher
    await t.none("INSERT INTO threadsaccess VALUES($1, $2)", [threadID, 'ITC']);

    let messageID = await t.one("INSERT INTO messages(threadID, contents, contentType, creatorID, isExternal) VALUES($1, $2, $3, $4, $5) RETURNING id", [threadID, req.body.content, 'text', req.body.username, req.body.isExternal])
    return {
      threadID: threadID,
      messageID: messageID
    }
  }).then(result => res.success(result))
    .catch(error => {console.log(error); res.failure(`${error}`)})
})

module.exports = threadRouter;