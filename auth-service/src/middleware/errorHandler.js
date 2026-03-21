function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = err.statusCode || 500;
  const body = {
    success: false,
    error: {
      message: err.message || 'Internal server error',
      ...(err.code && { code: err.code }),
    },
  };
  if (process.env.NODE_ENV !== 'production' && status === 500) {
    body.error.stack = err.stack;
  }
  res.status(status).json(body);
}

module.exports = errorHandler;
