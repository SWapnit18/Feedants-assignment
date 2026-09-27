const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getCompetitionState, STATES } = require('../utils/competitionState');

/**
 * POST /api/competitions/:id/register
 *
 * This is the endpoint that has to survive "thousands of concurrent users"
 * hammering the last few spots at once, so it's worth spelling out the
 * concurrency strategy:
 *
 * 1. Atomic capacity check-and-increment.
 *    We never do "read spotsLeft, check in JS, then write" -- that's a
 *    classic TOCTOU race where two requests can both read spotsLeft=1 and
 *    both proceed. Instead we issue a single findOneAndUpdate with the
 *    capacity check baked into the query filter itself
 *    ($expr: spotsBooked < totalSpots). MongoDB guarantees this
 *    find-and-modify is atomic per document, so only one of two racing
 *    requests for the last spot can possibly succeed; the other gets
 *    matchedCount 0 back and is told the competition is full.
 *
 * 2. Duplicate-registration guard via unique index.
 *    Even after reserving a spot, a user could (e.g. via two browser tabs)
 *    fire two register calls. Both could pass the capacity check if there
 *    happen to be 2+ spots left, incrementing the counter twice for the
 *    same person. The partial-unique index on Registration{competition,
 *    user, status:'active'} makes the SECOND insert fail with E11000. We
 *    catch that and roll back the spot we speculatively reserved in step 1,
 *    so spotsBooked always stays consistent with the number of real active
 *    registrations.
 *
 * 3. Mongo transaction.
 *    Steps 1 and the Registration insert are wrapped in a session/
 *    transaction so a crash between them can't leave a "phantom" reserved
 *    seat with no corresponding registration document. (Requires Mongo
 *    running as a replica set, which is the default in production/Atlas;
 *    see README for local single-node dev fallback.)
 */
const registerForCompetition = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid competition id');

  const competition = await Competition.findOne({ _id: id, isPublished: true }).lean();
  if (!competition) throw new ApiError(404, 'Competition not found');
  if (competition.isCancelled) throw new ApiError(409, 'This competition has been cancelled');

  const state = getCompetitionState(competition);
  if (state !== STATES.REGISTRATION_OPEN) {
    const message =
      state === STATES.REGISTRATION_FULL
        ? 'All spots are booked'
        : state === STATES.UPCOMING
        ? 'Registration has not opened yet'
        : 'Registration is closed for this competition';
    throw new ApiError(409, message);
  }

  // Fast, non-authoritative pre-check purely for a friendlier error message
  // in the common (non-racing) case. The unique index remains the actual
  // source of truth for correctness -- this check does NOT replace it.
  const existing = await Registration.findOne({
    competition: id,
    user: userId,
    status: 'active',
  }).lean();
  if (existing) throw new ApiError(409, 'You are already registered for this competition');

  let registration;
  let useTransactions = true;

  try {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const updated = await Competition.findOneAndUpdate(
          {
            _id: id,
            $expr: { $lt: ['$spotsBooked', '$totalSpots'] },
          },
          { $inc: { spotsBooked: 1 } },
          { new: true, session }
        );

        if (!updated) {
          throw new ApiError(409, 'All spots were just booked. Please try another competition.');
        }

        const [doc] = await Registration.create(
          [
            {
              competition: id,
              user: userId,
              entryFeePaid: competition.entryFee,
              paymentId: req.body.paymentId || null,
              paymentStatus: competition.entryFee > 0 ? 'paid' : 'paid',
              referralCodeUsed: req.body.referralCode || null,
              status: 'active',
            },
          ],
          { session }
        );

        registration = doc;
      });
    } catch (txErr) {
      if (
        txErr.message &&
        (txErr.message.includes('replica set') || txErr.message.includes('Transaction numbers'))
      ) {
        useTransactions = false;
      } else {
        throw txErr;
      }
    } finally {
      await session.endSession();
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    useTransactions = false;
  }

  // Fallback for standalone Mongo deployment without replica set
  if (!useTransactions && !registration) {
    const updated = await Competition.findOneAndUpdate(
      {
        _id: id,
        $expr: { $lt: ['$spotsBooked', '$totalSpots'] },
      },
      { $inc: { spotsBooked: 1 } },
      { new: true }
    );

    if (!updated) {
      throw new ApiError(409, 'All spots were just booked. Please try another competition.');
    }

    try {
      registration = await Registration.create({
        competition: id,
        user: userId,
        entryFeePaid: competition.entryFee,
        paymentId: req.body.paymentId || null,
        paymentStatus: competition.entryFee > 0 ? 'paid' : 'paid',
        referralCodeUsed: req.body.referralCode || null,
        status: 'active',
      });
    } catch (createErr) {
      // Compensate / Roll back spot reservation on duplicate or validation failure
      await Competition.findByIdAndUpdate(id, { $inc: { spotsBooked: -1 } });
      if (createErr.code === 11000) {
        throw new ApiError(409, 'You are already registered for this competition');
      }
      throw createErr;
    }
  }

  const updatedComp = await Competition.findById(competition._id).select('totalSpots maxParticipants spotsBooked').lean();
  const totalSpots = updatedComp ? (updatedComp.totalSpots || updatedComp.maxParticipants || 20) : 20;
  const spotsBooked = updatedComp ? updatedComp.spotsBooked : 1;
  const spotsLeft = Math.max(totalSpots - spotsBooked, 0);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      registrationId: registration._id,
      registeredAt: registration.createdAt,
      status: registration.status,
      isRegistered: true,
      spotsBooked,
      spotsLeft,
      availableSpots: spotsLeft,
      totalSpots,
      maxParticipants: totalSpots,
    },
  });
});

module.exports = { registerForCompetition };
