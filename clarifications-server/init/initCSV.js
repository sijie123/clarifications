const csv = require('csv-parser')
const fs = require('fs')

const { db, errors, AuthService } = require('../util/common.js');

createRole = async (groupname, role) => {
  if (role !== 'CONTESTANT' && role !== 'COMMITTEE' && role !== 'VOLUNTEER') throw new errors.InvalidInputError('Invalid role');
  return db.none("INSERT INTO usergroups VALUES($1, $2)", [groupname, role])
}

createUser = async (username, displayname, password, groupname, internaldisplayname) => {
  return AuthService.create({
    username: username,
    displayname: displayname,
    password: password,
    groupname: groupname,
    internaldisplayname: internaldisplayname,
  });
}

createSeat = async (seatname, locationText, map, x1, y1, x2, y2) => {
  return db.none("INSERT INTO plugin_seat VALUES ($1, $2, $3, $4, $5, $6, $7)", [seatname, locationText, map, x1, y1, x2, y2])
}

assignSeat = async (username, seatname) => {
  return db.none("INSERT INTO plugin_userlocation VALUES ($1, $2)", [username, seatname])
}

readCSV = (filename) => {
  return new Promise((resolve, reject) => {
    let results = []
    fs.createReadStream(filename)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
  });
}

let promises = createRole('CON', 'CONTESTANT')
  .then(() => createRole('OPS', 'COMMITTEE'))
  .then(() => createRole('SCI', 'COMMITTEE'))
  .then(() => readCSV('users.csv'))
  .then(users => users.forEach(async user => {
    await createUser(user.username, user.displayname, user.password, user.groupname, user.internaldisplayname);
  }))
  .then(() => {
    console.log("Created successfully.")
  })
