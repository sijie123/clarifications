const express = require('express');
const { check, body, cookie } = require('express-validator');
const updateRouter = express.Router();
const { db, errors, auth, validate, strftime } = require('../util/common.js');

/* Message format: 
  {
    threadID: String,
    answered: String,
    subject: String,
    message: {
      ID: Number,
      content: String,
      author: String,
      timestamp: Timestamp
    }
  }
*/
updateRouter.post('/', [
  body(['username', 'token']).exists(),
  body('currentUpdateTimestamp').exists().custom(currentUpdateTimestamp => {
    if (typeof currentUpdateTimestamp != 'number' || currentUpdateTimestamp < 0) throw new Error("currentUpdateTimestamp is not a number.");
    return true;
  })
], validate, async (req, res) => {
  auth.authenticateUserToken(req.body.username, req.body.token)
  .then(() => {
    return db.query("\
      SELECT array_agg(json_build_object('ID', messages.id, 'content', messages.contents, 'contenttype', messages.contenttype, 'author', users.groupname || ' ' || users.displayname, 'updated', messages.updated, 'isExternal', messages.isExternal)) as messages, threads.ID, threads.status as answer, threads.subject, threads.title, threads.contestantID, threads.created, EXTRACT(EPOCH FROM threads.updated) as updated \
      FROM messages \
      INNER JOIN threads ON (messages.threadID = threads.ID) \
      INNER JOIN users ON (messages.creatorID = users.username) \
      INNER JOIN usergroups USING (groupname) \
      WHERE EXISTS ( \
        SELECT 1 FROM users U2 \
        INNER JOIN threadsaccess TA2 USING (groupname) \
        WHERE TA2.threadid = threads.ID \
        AND U2.username = $1 \
        UNION \
        SELECT 1 \
        FROM threads T2 \
        WHERE T2.contestantID = $1 \
        AND T2.ID = threads.ID \
      ) \
      AND threads.updated > TO_TIMESTAMP($2) \
      AND ( (usergroups.role = 'CONTESTANT' AND messages.isExternal = TRUE) OR (usergroups.role <> 'CONTESTANT') ) \
      GROUP BY threads.id", [req.body.username, req.body.currentUpdateTimestamp])
  })
  .then(newMessages => {
    let formattedData = newMessages.map(result => {
      result.created = `${strftime('%H:%M:%S', new Date(result.created))}`;
      result.messages.map(msg => {
        msg.updated = `${strftime('%H:%M:%S', new Date(msg.updated))}`;
      })
      console.log(result);
      return result;
      // return {
      //   threadID: result['threadid'],
      //   answered: result['status'],
      //   subject: result['subject'],
      //   title: result['title'],
      //   updated: result['threadtime'],
      //   message: {
      //     ID: result['id'],
      //     content: result['contents'],
      //     author: result['author'],
      //     timestamp: `${strftime('%H:%M', result['messagetime'])}`
      //   }
      // }
    });
    // console.log(formattedData)
    return res.success({threads: formattedData, updated: new Date().getTime() / 1000});
  })
  .catch(err => { console.log(err); res.failure(`${err}`) })
})

module.exports = updateRouter;