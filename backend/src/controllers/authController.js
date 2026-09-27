const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Minimal login endpoint. NOTE: this is a stand-in so the assignment can be
 * run end-to-end standalone -- a real Feedants deployment almost certainly
 * has an existing auth/identity service that this feature would plug into
 * instead (see README assumptions).
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  res.json({
    success: true,
    data: { token, user: { id: user._id, name: user.name, email: user.email } },
  });
});

module.exports = { login };
