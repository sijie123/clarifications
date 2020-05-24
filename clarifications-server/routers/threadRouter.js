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

const canPost = async (req, res, next) => {
  return db.one("SELECT 1 FROM threads WHERE contestantID = $1 AND id = $2\
          UNION \
          SELECT 1 FROM threads \
          INNER JOIN threadsaccess ON (threads.id = threadsaccess.threadID) \
          INNER JOIN users USING (groupname) \
          WHERE users.username = $1 \
          AND threads.id = $2", [req.body.username, req.params.threadID])
    .then(exists => {
      next();
    }).catch(err => {
      console.log(err);
      return res.failure(new errors.ClientError("Thread doesn't exist!")); // Say thread doesn't exist, instead of no permission. We don't want user to know thread exists!
    })
}

// const truncate = (input) => {
//   if (input.length <= 100) return input;
//   return input.slice(0, 97) + "..."; 
// }
threadRouter.post('/:threadID/', [
  body('content').exists().notEmpty(),
  param('threadID').custom(threadID => {
    return db.one("SELECT 1 FROM threads WHERE id = $1", [threadID])
      .catch(err => {
        console.log(err);
        throw new Error("Thread doesn't exist!");
      })
  })
], validate, authMiddleware, canPost, async (req, res) => {
  //Already authenticated
  if (req.body.isExternal === undefined) {console.warn("isExternal is missing"); req.body.isExternal = true;}
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
  body('message').custom(message => {
    if (message.subject === '') throw new errors.ClientError("Message cannot be empty.")
    if (message.content === '') throw new errors.ClientError("Content cannot be empty.")
    return true;
  })
], validate, authMiddleware, async (req, res) => {
  //Already authenticated
  if (req.body.message.isAnnouncement === undefined) req.body.message.isAnnouncement = false;
  db.tx(async t => {
    let result = await t.one("INSERT INTO threads (subject, title, status, contestantID, isAnnouncement) VALUES ($1, $2, $3, $4, $5) RETURNING id", [req.body.message.subject, req.body.message.content, 'Awaiting Answer', req.body.username, req.body.message.isAnnouncement])
    let threadID = result['id']

    //This step will be done by human dispatcher
    await t.none("INSERT INTO threadsaccess VALUES($1, $2)", [threadID, 'ITC']);

    let messageID = await t.one("INSERT INTO messages(threadID, contents, contentType, creatorID, isExternal) VALUES($1, $2, $3, $4, $5) RETURNING id", [threadID, req.body.message.content, 'text', req.body.username, true])
    return {
      threadID: threadID,
      messageID: messageID
    }
  }).then(result => res.success(result))
    .catch(error => {console.log(error); res.failure(`${error}`)})
})

module.exports = threadRouter;