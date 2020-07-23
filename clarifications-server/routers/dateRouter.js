const express = require('express');
const dateRouter = express.Router();
const config = require('../config.js')

dateRouter.get('/', async (req, res) => {
  let date_now = new Date();
  let contest_start = new Date(config.contest_start);
  return res.success({timeToStart: contest_start - date_now});
})

module.exports = dateRouter;