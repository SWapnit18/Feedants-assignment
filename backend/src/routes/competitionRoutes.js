const express = require('express');
const { param } = require('express-validator');
const { getCompetitions, getCompetitionDetails, getPreviousWinners } = require('../controllers/competitionController');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', optionalAuth, getCompetitions);

router.get(
  '/:id',
  optionalAuth,
  validate([param('id').isMongoId()]),
  getCompetitionDetails
);

router.get(
  '/:id/winners',
  validate([param('id').isMongoId()]),
  getPreviousWinners
);

module.exports = router;
