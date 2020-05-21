const { db, errors, auth } = require('../util/common.js');
const bcrypt = require('bcrypt');

createRole = async (groupname, role) => {
  if (role !== 'CONTESTANT' && role !== 'COMMITTEE' && role !== 'SUPPORT') throw new errors.InvalidInputError('Invalid role');
  return db.none("INSERT INTO usergroups VALUES($1, $2)", [groupname, role])
}

createUser = async (username, displayname, password, groupname) => {
  return bcrypt.hash(password, 10).then(hash => {
    // Store hash in your password DB.
    return db.none("INSERT INTO users (username, displayname, password, groupname) VALUES($1, $2, $3, $4)", [username, displayname, hash, groupname])
      .catch(error => { throw new errors.ServerError(error) });
  });
}

createRole('ITC', 'COMMITTEE')
.then(() => createRole('ISC', 'COMMITTEE'))
.then(() => createRole('CON', 'CONTESTANT'))
.then(() => createUser('itc', 'Lin Si Jie', 'linsijie', 'ITC'))
.then(() => createUser('isc', 'William Gan', 'linsijie', 'ISC'))
.then(() => createUser('con', 'John Tan', 'linsijie', 'CON'))
.then(() => console.log("Create user success"))
.catch (err => console.log(err))

// auth.authenticateUserPass('sijie', 'linsijie')
//   .then(res => console.log(res))