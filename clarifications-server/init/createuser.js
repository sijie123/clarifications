const { db, errors, AuthService } = require('../util/common.js');
const bcrypt = require('bcrypt');

createRole = async (groupname, role) => {
  if (role !== 'CONTESTANT' && role !== 'COMMITTEE' && role !== 'VOLUNTEER') throw new errors.InvalidInputError('Invalid role');
  return db.none("INSERT INTO usergroups VALUES($1, $2)", [groupname, role])
}

createUser = async (username, displayname, password, groupname) => {
  return AuthService.create({
    username: username,
    displayname: displayname,
    password: password,
    groupname: groupname
  });
}

createSeat = async (seatname, locationText, map, x1, y1, x2, y2) => {
  return db.none("INSERT INTO plugin_seat VALUES ($1, $2, $3, $4, $5, $6, $7)", [seatname, locationText, map, x1, y1, x2, y2])
}

assignSeat = async (username, seatname) => {
  return db.none("INSERT INTO plugin_userlocation VALUES ($1, $2)", [username, seatname])
}

createRole('ITC', 'COMMITTEE')
.then(() => createRole('ISC', 'COMMITTEE'))
.then(() => createRole('CON', 'CONTESTANT'))
.then(() => createRole('VOL', 'VOLUNTEER'))
.then(() => createUser('itc', 'Lin Si Jie', 'linsijie', 'ITC'))
.then(() => createUser('isc', 'William Gan', 'linsijie', 'ISC'))
.then(() => createUser('con', 'John Tan', 'linsijie', 'CON'))
.then(() => createUser('SS02', 'Sam See', 'linsijie', 'CON'))
.then(() => createUser('vol', 'Tan Ah Kow', 'linsijie', 'VOL'))
.then(() => createSeat('A1', 'MPSH Sector A Seat 1', 'mpsh2', 165, 70, 182, 78))
.then(() => createSeat('A2', 'MPSH Sector A Seat 1', 'mpsh2', 182, 61, 199, 70))
.then(() => assignSeat('con', 'A1'))
.then(() => assignSeat('SS02', 'A2'))
.then(() => console.log("Create user success"))
.catch (err => console.log(err))

// createUser('ss01', 'SS01 John Tan', 'nopwd', 'CON')