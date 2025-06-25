// Middleware global de manejo de errores
export const globalErrorHandler = (err, req, res, next) => {
    // Establecer valores predeterminados
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational ?? (statusCode < 500);
    // Loggear el error (puedes usar un logger más sofisticado como Winston o Pino)
    console.error('--- ERROR LOG ---');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Route:', `${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.error('Request Body:', JSON.stringify(req.body, null, 2));
    }
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack || 'No stack trace available');
    console.error('--- END ERROR LOG ---');
    // Manejo de errores específicos de Ethers.js
    let message = err.message || 'An unexpected error occurred.';
    if (err.reason && typeof err.reason === 'string') {
        message = `Blockchain error: ${err.reason}`;
    }
    else if (err.code === 'CALL_EXCEPTION' || err.code === 'TRANSACTION_REVERTED') {
        message = `Blockchain transaction reverted. ${err.reason || 'Check contract logic or inputs.'}`;
    }
    else if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
        message = 'Blockchain error: Unpredictable gas limit. Check transaction parameters.';
    }
    // Enviar respuesta al cliente
    if (process.env.NODE_ENV === 'development') {
        res.status(statusCode).json({
            status: 'error',
            message,
            stack: err.stack,
            ...(err.response && { response: err.response }), // Incluir detalles de Axios si aplica
        });
    }
    else {
        res.status(statusCode).json({
            status: 'error',
            message: isOperational ? message : 'Something went very wrong!',
        });
    }
};
// Clase de error personalizada
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Errores creados con AppError son operacionales por defecto
        Error.captureStackTrace(this, this.constructor);
    }
}
