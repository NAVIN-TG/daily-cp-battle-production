exports.errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message, err.stack);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, error: errors.join(', ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, error: `${field} already exists` });
  }
  if (err.name === 'CastError')
    return res.status(400).json({ success: false, error: 'Invalid ID format' });

  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
