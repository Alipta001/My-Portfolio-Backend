function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, _next) {
  const status = error.status || 500;
  console.error(`${req.method} ${req.originalUrl} failed:`, error.stack || error.message);
  const message = status === 500 ? 'Something went wrong' : error.message;
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(status).json({ success: false, message, data: [] });
  }
  res.status(status).render('error', { title: 'Error', message });
}

module.exports = { notFound, errorHandler };
