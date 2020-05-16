const bcrypt = require('bcrypt');
const errors = require('./error.js');

const db = require('./db.js');

const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(); // Default is a 128-bit UID encoded in base58

const authenticateUserPass = async (username, password) => {
  return db.tx(async t => {
    let result = await t.one("SELECT password, role FROM users WHERE username = $1", [username]);
    return bcrypt.compare(password, result['password'])
      .then(async isCorrectPassword => {
        if (isCorrectPassword) {
          let token = await uidgen.generate();
          await t.none("UPDATE users SET token = $1 WHERE username = $2", [token, username]);
          return {
            username: username,
            role: result["role"],
            token: token
          }
        } else throw new errors.AuthenticationError("Incorrect username/password.");
      })
  })
}

const authenticateUserToken = async (username, token) => {
  return db.tx(async t => {
    let result = await t.one("SELECT username, role, token FROM users WHERE username = $1 AND token = $2", [username, token]);
    await t.none("UPDATE users SET token = '' WHERE username = $1", [username]); // Tokens should only be used once!
    return {
      username: username,
      role: result["role"],
      token: ""
    }
  }).catch(error => {
    console.log(error);
    throw new errors.AuthenticationError("Incorrect username/token.");
  })
}

module.exports = {
  authenticateUserPass: authenticateUserPass,
  authenticateUserToken: authenticateUserToken
}