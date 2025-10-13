import { Request, Response, NextFunction } from 'express';
import { DomainException, ValidationException } from '../../../domain/exceptions/index.js';

/**
 * Middleware global de manejo de errores para arquitectura hexagonal
 */
export class ErrorMiddleware {
    static handle(err: Error, req: Request, res: Response, next: NextFunction): void {
        console.error('Error:', err);

        // Domain Exception
        if (err instanceof DomainException) {
            res.status(400).json({
                success: false,
                error: {
                    type: 'DomainError',
                    message: err.message
                }
            });
            return;
        }

        // Validation Exception
        if (err instanceof ValidationException) {
            res.status(422).json({
                success: false,
                error: {
                    type: 'ValidationError',
                    message: err.message,
                    details: err.errors
                }
            });
            return;
        }

        // Generic Error
        const statusCode = (err as any).statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: {
                type: 'InternalError',
                message: process.env.NODE_ENV === 'production'
                    ? 'An unexpected error occurred'
                    : err.message,
                ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
            }
        });
    }
}
