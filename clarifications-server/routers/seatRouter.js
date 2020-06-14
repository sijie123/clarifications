const express = require('express');
const { check, body, param, cookie } = require('express-validator');
const seatRouter = express.Router();
const { db, errors, auth, validate, adapters } = require('../util/common.js');

const authMiddleware = async (req, res, next) => {
  if (req.body.username && req.body.token) {
    auth.authenticateUserToken(req.body.username, req.body.token)
      .then(result => {
        if (result.role === "CONTESTANT") throw new errors.AuthenticationError("Contestants do not have access to this API.");
        return result;
      })
      .then(auth => {req.auth = auth; next()})
      .catch(err => res.failure(err));
  } else {
    return res.failure(new errors.AuthenticationError("No usable authentication provided."));
  }
}

seatRouter.post('/:username', async (req, res) => {
  if (!('ContestantLocation' in adapters)) {
    return res.failure("Contestant location not available.", 404);
  }
  let ContestantLocationAdapter = adapters['ContestantLocation'];
  let result = await new ContestantLocationAdapter(req.params.username).queryText();
  if (result.success) {
    res.success(result.data)
  } else {
    res.failure(result.errorMessage, result.errorCode)
  }
})

seatRouter.get('/map/:seatname', async (req, res) => {
  if (!('ContestantLocation' in adapters)) {
    return res.failure("Contestant location not available.", 404);
  }
  let ContestantLocationAdapter = adapters['ContestantLocation'];
  let result = await new ContestantLocationAdapter(req.params.seatname).queryMap();
  if (result.success) {
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31557600'
    }).send(result.data)
  } else {
    console.log(result);
    res.failure(result.errorMessage, result.errorCode)
  }
})

module.exports = seatRouter;