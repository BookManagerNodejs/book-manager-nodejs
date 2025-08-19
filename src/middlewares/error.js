
function errorHandler(err, req, res, next) {
    if (process.env.NODE_ENV !== 'test') {
        console.error('[ERROR]', err);
    } else {
        console.error('[ERROR]', { message: err.message, statusCode: err.statusCode });
    }
    if (res.headersSent) return next(err);
    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    return res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
}
module.exports = errorHandler;
