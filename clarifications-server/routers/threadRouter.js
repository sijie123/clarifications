const express = require('express');
const { check, body, param, cookie } = require('express-validator');
const threadRouter = express.Router();
const { db, errors, validate, publishThread, publishMessage } = require('../util/common.js');
const fs = require('fs');
const crypto = require('crypto');

const canReply = async (req, res, next) => {
  return db.one("SELECT 1 FROM threads WHERE senderID = $1 AND id = $2\
          UNION \
          SELECT 1 FROM threads \
          INNER JOIN threadsaccess ON (threads.id = threadsaccess.threadID) \
          INNER JOIN users USING (groupname) \
          WHERE users.username = $1 \
          AND threads.id = $2", [req.auth.username, req.params.threadID])
    .then(exists => {
      next();
    }).catch(err => {
      console.log(err);
      return res.failure(new errors.ClientError("Thread doesn't exist!")); // Say thread doesn't exist, instead of no permission. We don't want user to know thread exists!
    })
}

const injectSenderID = async (req, res, next) => {
  if (req.body.message.createdFor) {
    if (req.auth.role === "CONTESTANT") return res.failure(new errors.AuthenticationError("Contestants do not have access to this API.")); 

    await db.one("SELECT 1 FROM users WHERE username = $1", [req.body.message.createdFor])
    .then(exists => {
      req.body.senderID = req.body.message.createdFor;
    })
    .catch(err => {
      return res.failure(new errors.ClientError("User specified does not exist."));
    })
  } else {
    req.body.senderID = req.auth.username;
  }
  next();
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
], validate, canReply, async (req, res) => {
  //Already authenticated
  if (req.body.isExternal === undefined) {console.warn("isExternal is missing"); req.body.isExternal = true;}
  db.one("INSERT INTO messages(threadID, contents, contentType, senderID, creatorID, isExternal) VALUES($1, $2, $3, $4, $4, $5) RETURNING id", [req.params.threadID, req.body.content, 'text', req.auth.username, req.body.isExternal])
  .then(result => res.success({
    threadID: req.params.threadID,
    messageID: result["id"]
  }))
  .catch(error => {console.log(error); res.failure(`${error}`)})
})

// New thread
threadRouter.post('/', [
  body('message').custom(message => {
    if (message.subject === '') throw new errors.ClientError("Message cannot be empty.")
    if (message.content === '') throw new errors.ClientError("Content cannot be empty.")
    return true;
  })
], validate, injectSenderID, async (req, res) => {
  //Already authenticated
  db.tx(async t => {
    let thread = await createThread(t, req);
    let attachment = null;
    if (req.body.message.attachment !== undefined) {
      attachment = await createAttachment(t, thread, req);
    }
    let message = await createText(t, thread, req);
    return {thread, message, attachment}
  }).then(({thread, message, attachment}) => {
    publishThread(thread);
    publishMessage(message);
    if (attachment != null) publishMessage(attachment);
    return {thread, message, attachment};
  }).then(({thread, message}) => res.success({threadID: thread.id, messageID: message.id}))
    .catch(error => {console.log(error); res.failure(`${error}`)})
})

module.exports = threadRouter;

const createThread = async (t, req) => {
  let thread = {
    subject: req.body.message.subject,
    title: req.body.message.content,
    status: 'Awaiting Answer',
    senderID: req.body.senderID,
    creatorID: req.auth.username,
    isAnnouncement: req.body.message.isAnnouncement !== null ? req.body.message.isAnnouncement : false,
    isLogistics: req.body.message.isLogistics !== null ? req.body.message.isLogistics : false,
  };
  let result = await t.one("INSERT INTO threads (subject, title, status, senderID, creatorID, isAnnouncement, isLogistics) \
                              VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id", [thread.subject, thread.title, thread.status, thread.senderID, thread.creatorID, thread.isAnnouncement, thread.isLogistics]);
  thread['id'] = result['id']
  return thread;
}

const saveImage = async (attachment, attachmentType, senderID) => {
  let ext = '';
  if (attachmentType === "image/jpeg") ext = "jpg";
  else if (attachmentType === "image/png") ext = "png";
  else throw new errors.ClientError("Only jpg/png images are accepted.");

  //Strip out the mime header
  let image = attachment.replace(/^data:image\/(png|gif|jpeg);base64,/,'');
  let buff = Buffer.from(image, 'base64');
  let hash = crypto.createHash('sha1').update(senderID).update(buff).digest('hex');
  let filename = `uploads/${hash}.${ext}`;

  fs.writeFileSync(filename, buff);
  return {filename, hash};
}

const createAttachment = async (t, thread, req) => {

  let {filename} = await saveImage(req.body.message.attachment, req.body.message.attachmentType, req.body.senderID);
  console.log(`We're saving to ${filename}.`);

  let message = {
    threadID: thread.id,
    contents: `api/${filename}`,
    contentType: req.body.message.attachmentType,
    senderID: req.body.senderID,
    creatorID: req.auth.username,
    isExternal: true
  };
  let result = await t.one("INSERT INTO messages(threadID, contents, contentType, senderID, creatorID, isExternal) \
                            VALUES($1, $2, $3, $4, $5, $6) RETURNING id", [message.threadID, message.contents, message.contentType, message.senderID, message.creatorID, message.isExternal]);
  message['id'] = result['id'];
  return message;
}

const createText = async (t, thread, req) => {
  let message = {
    threadID: thread.id,
    contents: req.body.message.content,
    contentType: 'text',
    senderID: req.body.senderID,
    creatorID: req.auth.username,
    isExternal: true
  };
  let result = await t.one("INSERT INTO messages(threadID, contents, contentType, senderID, creatorID, isExternal) \
                            VALUES($1, $2, $3, $4, $5, $6) RETURNING id", [message.threadID, message.contents, message.contentType, message.senderID, message.creatorID, message.isExternal]);
  message['id'] = result['id'];
  return message;
}

