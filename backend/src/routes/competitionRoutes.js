const express = require('express');
const { param } = require('express-validator');
const { getCompetitions, getCompetitionDetails, getPreviousWinners, getReviews } = require('../controllers/competitionController');
const { optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', optionalAuth, getCompetitions);
router.get('/featured', optionalAuth, getCompetitions);

router.get(
  '/:id',
  optionalAuth,
  validate([param('id').isString().trim().notEmpty()]),
  getCompetitionDetails
);

router.get(
  '/:id/winners',
  validate([param('id').isString().trim().notEmpty()]),
  getPreviousWinners
);

router.get(
  '/:id/reviews',
  validate([param('id').isString().trim().notEmpty()]),
  getReviews
);

module.exports = router;
