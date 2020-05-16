const config = require('../config.js');
const pgp = require('pg-promise')();
const conn = config.DB_URI;

// Creating a new database instance from the connection details:
let db = pgp(conn);

module.exports = db;
