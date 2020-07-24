const express = require('express');
const { check, body, cookie } = require('express-validator');
const updateRouter = express.Router();
const { db, errors, validate, strftime } = require('../util/common.js');

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
  body('currentUpdateTimestamp').exists().custom(currentUpdateTimestamp => {
    if (typeof currentUpdateTimestamp != 'number' || currentUpdateTimestamp < 0) throw new Error("currentUpdateTimestamp is not a number.");
    return true;
  })
], validate, async (req, res) => {
  db.query("\
    WITH userRole AS ( \
      SELECT auth.username, authgroups.role FROM users as auth \
      INNER JOIN usergroups AS authgroups USING (groupname) \
      WHERE auth.username = $1 \
    ), \
    visibilityArr AS ( \
      SELECT threadid, array_agg(groupname) as visibility \
      FROM threadsaccess \
      GROUP BY threadid \
    ), \
    authors AS ( \
      SELECT users.username, \
        CASE WHEN auth.role = 'CONTESTANT' THEN users.displayname \
             ELSE users.internaldisplayname \
        END AS author \
      FROM users \
      CROSS JOIN userRole as auth \
    ) \
    SELECT \
      array_agg( \
        json_build_object( \
          'ID', messages.id, \
          'content', messages.contents, \
          'contenttype', messages.contenttype, \
          'sender', senders.author, \
          'creator', creators.author, \
          'updated', TO_CHAR(messages.updated, 'HH24:MI:SS'), \
          'isExternal', messages.isExternal \
        ) \
      ) AS messages, \
      threads.ID, \
      threads.status AS answer, \
      threads.subject, \
      threads.title, \
      threads.senderID, \
      threads.creatorID, \
      TO_CHAR(threads.created, 'HH24:MI:SS') AS created, \
      threads.isAnnouncement, \
      array_agg(DISTINCT VA.visibility) AS visibility, \
      EXTRACT(EPOCH FROM threads.updated) AS updated \
    FROM messages \
    INNER JOIN (threads INNER JOIN visibilityArr VA ON (threads.id = VA.threadid) ) ON (messages.threadID = threads.ID) \
    INNER JOIN authors AS creators ON (messages.creatorID = creators.username) \
    INNER JOIN authors AS senders ON (messages.senderID = senders.username) \
    CROSS JOIN userRole as auth \
    WHERE auth.username IN ( \
      SELECT username FROM users U2 \
      INNER JOIN threadsaccess TA USING (groupname) \
      WHERE TA.threadid = threads.ID \
      UNION \
      SELECT senderID FROM threads T2 \
      WHERE T2.ID = threads.ID \
      UNION \
      SELECT username FROM userRole \
      CROSS JOIN threads T3 \
      WHERE T3.ID = threads.ID AND T3.isAnnouncement = TRUE \
    ) AND ( (auth.role <> 'CONTESTANT') OR (auth.role = 'CONTESTANT' AND messages.isExternal = TRUE)) \
    AND threads.updated > TO_TIMESTAMP($2) \
    GROUP BY threads.id", [req.auth.username, req.body.currentUpdateTimestamp])
  .then(newMessages => {
    let formattedData = newMessages.map(result => {
      result.visibility = result.visibility[0];
      return result;
    });
    // Dial the clock back 7 seconds to reduce race condition.
    return res.success({threads: formattedData, updated: new Date().getTime() / 1000 - 7});
  })
  .catch(err => { console.log(err); res.failure(`${err}`) })
})

module.exports = updateRouter;