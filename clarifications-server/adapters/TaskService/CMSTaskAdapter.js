const errors = require('../../util/error.js');
const config = require('../../config.js');
const {cmsdb} = require('../../util/db.js');

class CMSTaskAdapter {

    static getTasks() {
        return cmsdb.query("SELECT title FROM tasks WHERE contest_id = $1", [config.contest_id])
        .catch(err => {
            throw new errors.ServerError("Failed to fetch tasks from CMS.");
        }).then(results => {
            return results.map(r => r.title);
        })
    }
}

module.exports = CMSTaskAdapter;