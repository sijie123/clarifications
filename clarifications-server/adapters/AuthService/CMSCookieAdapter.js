const bcrypt = require('bcrypt');
const errors = require('../../util/error.js');
const {cmsdb} = require('../../util/db.js');
const Promise = require('bluebird');

const cookie = require('cookie');

class CMSCookieAdapter {

    static _authenticate(username, token) {
        // TODO: Connect to CMS Database!!
        return cmsdb.one("SELECT username, password FROM users WHERE username = $1 LIMIT 1", [username])
            .catch(err => {
                // If user doesn't exist...
                throw new errors.AuthenticationError("Incorrect username/password.");
            })
            .then(user => {
                if (token !== user['password']) throw new errors.AuthenticationError("Invalid token.");
                return user['username'];
            })
    }

    static _parseToken(token) {
        //Expected format: 2|1:0|<LEN>:<TIMESTAMP>|<LEN>:ContestName_login|<LEN>:<Base64 Token>|hash
        let data = token.split("|");
        if (data.length != 6) return null;
        //The data we want is the 0-indexed 4th item.
        try {
            let credentials = data[4].split(":")[1];
            let arrString = Buffer.from(credentials, "base64").toString();
            let arr = JSON.parse(arrString);
            // Username is 0th element, password is 1st element.
            return {username: arr[0], token: arr[1]};
        } catch (err) {
            //Decode failed. Prolly token was wrong.
            return null;
        }
    }
    static _findWorkingCookie(authData) {
        let cookies = cookie.parse(authData);
        let keys = Object.keys(cookies);
        for (let k of keys) {
            if (k.endsWith("_login")) {
                let auth = this._parseToken(cookies[k]);
                if (auth == null) continue;
                if (this._authenticate(auth.username, auth.token)) return auth.username;
            }
        }
        throw new errors.AuthenticationError("Invalid username/token.");
    }
    static login(req) {
        return Promise.try(() => {
            if (!req.body.clarificationData) throw new errors.AuthenticationError("Token not found.");
            return req.body.clarificationData;
        }).then((token) => {
            return this._findWorkingCookie(token);
        })
    }

    static create(req) {
        throw new Error("Not Implemented.");
    }
}

module.exports = CMSCookieAdapter;