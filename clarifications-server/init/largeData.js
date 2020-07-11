const { db, errors, AuthService } = require('../util/common.js');
const bcrypt = require('bcrypt');

createThread = async (t, content, author) => {
  let thread = {
    subject: "Fixed Subject",
    title: content,
    status: 'Awaiting Answer',
    senderID: author,
    creatorID: author,
    isAnnouncement: false ,
    isLogistics: false ,
  }
  let res = await t.one("INSERT INTO threads (subject, title, status, senderID, creatorID, isAnnouncement, isLogistics) \
                            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id", [thread.subject, thread.title, thread.status, thread.senderID, thread.creatorID, thread.isAnnouncement, thread.isLogistics])

  let message = {
    threadID: res.id,
    contents: content,
    contentType: 'text',
    senderID: author,
    creatorID: author,
    isExternal: true
  }
  await t.one("INSERT INTO messages(threadID, contents, contentType, senderID, creatorID, isExternal) \
                        VALUES($1, $2, $3, $4, $5, $6) RETURNING id", [message.threadID, message.contents, message.contentType, message.senderID, message.creatorID, message.isExternal])
  return t.none("INSERT INTO threadsaccess VALUES ($1, $2)", [res.id, 'ITC'])
}

answerThread = async (t, threadID) => {
  return t.none("UPDATE threads SET status = 'Yes' WHERE id = $1", [threadID]);
}

createUser = async (username, displayname, password, groupname) => {
  return AuthService.create({
    username: username,
    displayname: displayname,
    password: password,
    groupname: groupname
  });
}

createRole = async (groupname, role) => {
  if (role !== 'CONTESTANT' && role !== 'COMMITTEE' && role !== 'VOLUNTEER') throw new errors.InvalidInputError('Invalid role');
  return db.none("INSERT INTO usergroups VALUES($1, $2)", [groupname, role])
}

const essay = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const words = essay.split(" ");

generateQuestion = () => {
  let qn = []
  for (let i = 0; i < 5; i++) {
    qn.push(words[Math.floor(Math.random() * words.length)])
  }
  return qn.join(' ');
}

createRole('ITC', 'COMMITTEE')
.then(() => createRole('ISC', 'COMMITTEE'))
.then(() => createRole('CON', 'CONTESTANT'))
.then(() => createRole('VOL', 'VOLUNTEER'))
.then(() => createUser(`itc`, `John Tan`, 'linsijie', 'ITC'))
.then(() => {
  return Promise.all(Array(400).fill().map( (_, i) => i + 1).map(i => createUser(`CON${i}`, `CON${i}`, 'pwd', 'CON')))
})
.then(() => {
  return db.tx(t => {
    return Promise.all(Array(2000).fill().map( (_, i) => i + 1).map(i => createThread(t, generateQuestion(), `CON${Math.ceil(i / 5)}`)))
  })
})
.then(() => {
  return db.tx(t => {
    return Promise.all(Array(2000).fill().map( (_, i) => i + 1).filter(i => i % 100 != 0).map(i => answerThread(t, i)))
  })
})
.then(() => {
  console.log("Generated successfully")
})

// createRole('ITC', 'COMMITTEE')
// .then(() => createRole('ISC', 'COMMITTEE'))
// .then(() => createRole('CON', 'CONTESTANT'))
// .then(() => createRole('VOL', 'VOLUNTEER'))
// .then(() => createUser('itc', 'Lin Si Jie', 'linsijie', 'ITC'))
// .then(() => createUser('isc', 'William Gan', 'linsijie', 'ISC'))
// .then(() => createUser('con', 'John Tan', 'linsijie', 'CON'))
// .then(() => createUser('SS02', 'Sam See', 'linsijie', 'CON'))
// .then(() => createUser('vol', 'Tan Ah Kow', 'linsijie', 'VOL'))
// .then(() => createSeat('A1', 'MPSH Sector A Seat 1', 'mpsh2', 165, 70, 182, 78))
// .then(() => createSeat('A2', 'MPSH Sector A Seat 1', 'mpsh2', 182, 61, 199, 70))
// .then(() => assignSeat('con', 'A1'))
// .then(() => assignSeat('SS02', 'A2'))
// .then(() => console.log("Create user success"))
// .catch (err => console.log(err))

// auth.authenticateUserPass('sijie', 'linsijie')
//   .then(res => console.log(res))