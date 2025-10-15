export function errorHandler(err, req, res, next) {
    console.error(err); // or use structured logger
    const status = err.status || 500;
    res.status(status).json({
        error: {
            message: err.message || 'Internal Server Error',
            details: err.details || undefined
        }
    });
}
