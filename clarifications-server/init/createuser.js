const { db, errors, auth } = require('../util/common.js');
const bcrypt = require('bcrypt');

createUser = async (username, password, role) => {
  if (role !== 'CONTESTANT' && role !== 'COMMITTEE' && role !== 'SUPPORT') return new Promise(() => { throw new errors.InvalidInputError('Invalid role'); });
  return bcrypt.hash(password, 10).then(hash => {
    // Store hash in your password DB.
    return db.none("INSERT INTO users (username, password, role) VALUES($1, $2, $3)", [username, hash, role])
      .catch(error => { throw new errors.ServerError(error) });
  });
}

// createUser('sijie', 'linsijie', 'COMMITTEE')
//     .catch (err => console.log(err))

auth.authenticateUserPass('sijie', 'linsijie')
  .then(res => console.log(res))