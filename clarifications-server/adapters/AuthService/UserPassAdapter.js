const bcrypt = require('bcrypt');
const errors = require('../../util/error.js');
const db = require('../../util/db.js');

class UserPassAdapter {

    static _authenticate(username, password) {
        return db.one("SELECT username, password FROM users WHERE username = $1", [username])
            .catch(err => {
                // If user doesn't exist...
                throw new errors.AuthenticationError("Incorrect username/password.");
            })
            .then(async user => {
                let isCorrectPassword = await bcrypt.compare(password, user['password']);
                if (!isCorrectPassword) throw new errors.AuthenticationError("Incorrect username/password.");
                return user['username'];
            })
    }

    static _createNew(username, displayname, password, groupname) {
        return bcrypt.hash(password, 1).then(hash => {
            return db.none("INSERT INTO users (username, displayname, password, groupname) VALUES($1, $2, $3, $4)", [username, displayname, hash, groupname])
            .catch(error => { throw new errors.ServerError(error) });
        });
    }
    static login(req) {
        return this._authenticate(req.body.username, req.body.password);
    }
    static create(req) {
        if (req.body !== undefined ) return this._createNew(req.body.username, req.body.displayname, req.body.password, req.body.groupname);
        return this._createNew(req.username, req.displayname, req.password, req.groupname)
    }
}

module.exports = UserPassAdapter;