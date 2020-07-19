const config = require('../../config.js');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const expressjwt = require('express-jwt');
const db = require('../../util/db.js');
const privateKey = fs.readFileSync('jwtprivate.key');
const publicKey = fs.readFileSync('jwtpublic.key');
const Promise = require("bluebird");
const errors = require('../../util/error.js');

const AuthAdapters = config.authAdapters.map(adapterName => {
    console.log(`Using AuthAdapter: ${adapterName}`)
    return require(`./${adapterName}.js`);
})
if (AuthAdapters.length == 0) {
    throw new Error("No auth handlers found. Set it in the config.authAdapters array.")
}

class AuthService {
    static signToken(user) {
        return jwt.sign(user, privateKey, { algorithm: 'RS256', expiresIn: '5h' });
    }
    static login(req) {
        let authAttempts = AuthAdapters.map(adapter => adapter.login(req));
        return Promise.any(authAttempts)
        .then(username => {
            return db.one("SELECT username, internaldisplayname AS displayname, groupname, role FROM users INNER JOIN usergroups USING (groupname) WHERE username = $1", [username])
                     .catch(err => {
                         console.log(err);
                         throw new errors.AuthenticationError("Invalid username/password/token.")
                     })
        }).then(user => {
            return this.signToken(user);
        })
    }

    static verify() {
        return expressjwt({
            secret: publicKey,
            requestProperty: 'auth',
            getToken: function fromHeaderOrQuerystring(req) {
                if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                    console.log("Bad token location, but I'll accept it for now.")
                    return req.headers.authorization.split(' ')[1];
                } else if (req.cookies && req.cookies.auth) {
                    return req.cookies.auth;
                }
                return null;
            }
        })
    }
    static create(req) {
        // Only userpass adapter is supported.
        if (config.authAdapters.indexOf('UserPassAdapter') == -1) throw new Error("UserPassAdapter not configured.");
        let UserPassAdapter = require('./UserPassAdapter.js');
        return UserPassAdapter.create(req)
    }
}

module.exports = AuthService;  