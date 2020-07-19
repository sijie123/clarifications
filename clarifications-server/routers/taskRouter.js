const express = require('express');
const taskRouter = express.Router();
const { adapters } = require('../util/common.js');

taskRouter.get('/', async (req, res) => {
  if (!('TaskService' in adapters)) {
    return res.failure("No tasks available.", 500)
  }
  adapters['TaskService'].getTasks()
  .then(tasks => {
    return res.success({tasks: tasks})
  }).catch(err => {
    console.log(err);
    return res.failure(err);
  })
})

module.exports = taskRouter;