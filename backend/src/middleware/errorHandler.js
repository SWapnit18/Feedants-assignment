const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || undefined,
    });
  }

  // Mongo duplicate key (e.g. double registration race, duplicate email)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'This action conflicts with an existing record.',
      details: err.keyValue,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  console.error('[unhandled error]', err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
