const bcrypt = require('bcrypt');
const errors = require('./error.js');

const db = require('./db.js');

const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(); // Default is a 128-bit UID encoded in base58

const authenticateUserPass = async (username, password) => {
  return db.tx(async t => {
    let result = await t.one("SELECT displayname, password, groupname, role FROM users INNER JOIN usergroups USING (groupname) WHERE username = $1", [username]);
    const isCorrectPassword = await bcrypt.compare(password, result['password']);
    if (isCorrectPassword) {
      let token = await uidgen.generate();
      await t.none("UPDATE users SET token = $1 WHERE username = $2", [token, username]);
      return {
        username: username,
        displayname: result["displayname"],
        groupname: result["groupname"],
        role: result["role"],
        token: token
      }
    } else throw new errors.AuthenticationError("Incorrect username/password.");
  })
}

const authenticateUserToken = async (username, token) => {
  return db.one("SELECT displayname, groupname, role FROM users INNER JOIN usergroups USING (groupname) WHERE username = $1 AND token = $2", [username, token])
  .then(result => {
    return {
      username: username,
      displayname: result["displayname"],
      groupname: result["groupname"],
      role: result["role"]
    }
  })
  .catch(error => {
    console.log(error);
    throw new errors.AuthenticationError("Incorrect username/token.");
  })
}

module.exports = {
  authenticateUserPass: authenticateUserPass,
  authenticateUserToken: authenticateUserToken
}