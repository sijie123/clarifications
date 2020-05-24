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
      WITH userRole AS ( \
        SELECT auth.username, authgroups.role FROM users as auth \
        INNER JOIN usergroups AS authgroups USING (groupname) \
        WHERE auth.username = $1 \
      ) \
      SELECT array_agg(json_build_object('ID', messages.id, 'content', messages.contents, 'contenttype', messages.contenttype, 'author', authors.groupname || ' ' || authors.displayname, 'updated', messages.updated, 'isExternal', messages.isExternal)) as messages, threads.ID, threads.status as answer, threads.subject, threads.title, threads.contestantID, threads.created, threads.isAnnouncement, EXTRACT(EPOCH FROM threads.updated) as updated \
      FROM messages \
      INNER JOIN threads ON (messages.threadID = threads.ID) \
      INNER JOIN users AS authors ON (messages.creatorID = authors.username) \
      CROSS JOIN userRole as auth \
      WHERE auth.username IN ( \
        SELECT username FROM users U2 \
        INNER JOIN threadsaccess TA USING (groupname) \
        WHERE TA.threadid = threads.ID \
        UNION \
        SELECT contestantID FROM threads T2 \
        WHERE T2.ID = threads.ID \
        UNION \
        SELECT username FROM userRole \
        CROSS JOIN threads T3 \
        WHERE T3.ID = threads.ID AND T3.isAnnouncement = TRUE \
      ) AND ( (auth.role <> 'CONTESTANT') OR (auth.role = 'CONTESTANT' AND messages.isExternal = TRUE)) \
      AND threads.updated > TO_TIMESTAMP($2) \
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
    console.log(formattedData)
    return res.success({threads: formattedData, updated: new Date().getTime() / 1000});
  })
  .catch(err => { console.log(err); res.failure(`${err}`) })
})

module.exports = updateRouter;