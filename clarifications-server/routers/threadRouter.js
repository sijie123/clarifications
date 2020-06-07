const express = require('express');
const { check, body, param, cookie } = require('express-validator');
const threadRouter = express.Router();
const { db, errors, auth, validate, publishThread, publishMessage } = require('../util/common.js');

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
  return db.one("SELECT 1 FROM threads WHERE senderID = $1 AND id = $2\
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
  db.one("INSERT INTO messages(threadID, contents, contentType, senderID, creatorID, isExternal) VALUES($1, $2, $3, $4, $4, $5) RETURNING id", [req.params.threadID, req.body.content, 'text', req.body.username, req.body.isExternal])
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
  db.tx(async t => {
    let threadCreatedFor = req.body.username;
    if (req.body.message.threadCreatedFor !== null) {
      await t.one("SELECT 1 FROM users INNER JOIN usergroups USING (groupname) WHERE role <> 'CONTESTANT' AND username = $1", [req.body.username])
      .catch(err => {
        throw new errors.ClientError("You are not allowed to use the threadCreatedFor API.")  
      })

      await t.one("SELECT 1 FROM users WHERE username = $1", [req.body.message.threadCreatedFor])
      .catch(err => {
        throw new errors.ClientError("User specified does not exist.")  
      })
      threadCreatedFor = req.body.message.threadCreatedFor;
    }
    let thread = {
      subject: req.body.message.subject,
      title: req.body.message.content,
      status: 'Awaiting Answer',
      senderID: threadCreatedFor,
      creatorID: req.body.username,
      isAnnouncement: req.body.message.isAnnouncement !== null ? req.body.message.isAnnouncement : false ,
      isLogistics: req.body.message.isLogistics !== null ? req.body.message.isLogistics : false ,
    }
    let result = await t.one("INSERT INTO threads (subject, title, status, senderID, creatorID, isAnnouncement, isLogistics) \
                              VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id", [thread.subject, thread.title, thread.status, thread.senderID, thread.creatorID, thread.isAnnouncement, thread.isLogistics])
    thread['id'] = result['id']

    if (req.body.message.attachment !== undefined) {
      let message = {
        threadID: thread.id,
        contents: req.body.message.attachment,
        contentType: req.body.message.attachmentType,
        senderID: threadCreatedFor,
        creatorID: req.body.username,
        isExternal: true
      }
      result = await t.one("INSERT INTO messages(threadID, contents, contentType, senderID, creatorID, isExternal) \
                            VALUES($1, $2, $3, $4, $5, $6) RETURNING id", [message.threadID, message.contents, message.contentType, message.senderID, message.creatorID, message.isExternal])
    }
    let message = {
      threadID: thread.id,
      contents: req.body.message.content,
      contentType: 'text',
      senderID: threadCreatedFor,
      creatorID: req.body.username,
      isExternal: true
    }
    result = await t.one("INSERT INTO messages(threadID, contents, contentType, senderID, creatorID, isExternal) \
                          VALUES($1, $2, $3, $4, $5, $6) RETURNING id", [message.threadID, message.contents, message.contentType, message.senderID, message.creatorID, message.isExternal])
    message['id'] = result['id'];
    return {
      thread: thread,
      message: message
    }
  }).then(result => {
    publishThread(result.thread);
    publishMessage(result.message);
    return result;
  }).then(result => res.success({threadID: result.thread.id, messageID: result.message.id}))
    .catch(error => {console.log(error); res.failure(`${error}`)})
})

module.exports = threadRouter;