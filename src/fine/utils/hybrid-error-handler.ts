/**
 * Manejo Centralizado de Errores para Arquitectura Híbrida Blockchain
 * Proporciona manejo consistente de errores entre Hyperledger y Ethereum
 */

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly context?: string;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true, context?: string) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.context = context;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

export class HybridErrorHandler {
    /**
     * Maneja errores específicos de blockchain
     */
    static handleBlockchainError(error: any, context: string): AppError {
        // Errores de Ethereum
        if (error.code === 'INSUFFICIENT_FUNDS') {
            return new AppError(
                'Fondos insuficientes para realizar la transacción',
                400,
                true,
                context
            );
        }

        if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
            return new AppError(
                'Error de conexión con la red blockchain',
                503,
                true,
                context
            );
        }

        if (error.code === 'GAS_LIMIT_EXCEEDED') {
            return new AppError(
                'Límite de gas excedido para la transacción',
                400,
                true,
                context
            );
        }

        if (error.code === 'NONCE_EXPIRED') {
            return new AppError(
                'Nonce expirado, reintente la transacción',
                400,
                true,
                context
            );
        }

        // Errores de Hyperledger Fabric
        if (error.message?.includes('does not exist')) {
            return new AppError(
                'Recurso no encontrado en la blockchain',
                404,
                true,
                context
            );
        }

        if (error.message?.includes('access denied') || error.message?.includes('unauthorized')) {
            return new AppError(
                'Acceso denegado a la operación blockchain',
                403,
                true,
                context
            );
        }

        if (error.message?.includes('endorsement')) {
            return new AppError(
                'Error en el proceso de endorsamiento de Hyperledger',
                500,
                true,
                context
            );
        }

        // Errores de IPFS
        if (error.message?.includes('IPFS') || error.code === 'IPFS_ERROR') {
            return new AppError(
                'Error al interactuar con IPFS',
                503,
                true,
                context
            );
        }

        // Error genérico de blockchain
        return new AppError(
            `Error en ${context}: ${error.message || 'Error desconocido'}`,
            500,
            true,
            context
        );
    }

    /**
     * Maneja errores de sincronización entre blockchains
     */
    static handleSyncError(error: any, fineId?: string): AppError {
        if (error.code === 'SYNC_TIMEOUT') {
            return new AppError(
                `Timeout en sincronización de multa ${fineId || 'desconocida'}`,
                408,
                true,
                'sync'
            );
        }

        if (error.code === 'DATA_INCONSISTENCY') {
            return new AppError(
                `Inconsistencia de datos entre blockchains para multa ${fineId || 'desconocida'}`,
                409,
                true,
                'sync'
            );
        }

        if (error.code === 'SYNC_CONFLICT') {
            return new AppError(
                `Conflicto de sincronización detectado para multa ${fineId || 'desconocida'}`,
                409,
                true,
                'sync'
            );
        }

        if (error.message?.includes('hash mismatch')) {
            return new AppError(
                `Verificación de integridad fallida para multa ${fineId || 'desconocida'}`,
                422,
                true,
                'sync'
            );
        }

        return new AppError(
            `Error de sincronización: ${error.message || 'Error desconocido'}`,
            500,
            true,
            'sync'
        );
    }

    /**
     * Maneja errores de validación
     */
    static handleValidationError(error: any, field?: string): AppError {
        if (error.details && Array.isArray(error.details)) {
            const firstError = error.details[0];
            const message = field 
                ? `Error de validación en ${field}: ${firstError.message}`
                : `Error de validación: ${firstError.message}`;
            
            return new AppError(message, 400, true, 'validation');
        }

        return new AppError(
            `Error de validación: ${error.message || 'Datos inválidos'}`,
            400,
            true,
            'validation'
        );
    }

    /**
     * Maneja errores de configuración
     */
    static handleConfigError(error: any, configKey?: string): AppError {
        const message = configKey 
            ? `Error de configuración en ${configKey}: ${error.message}`
            : `Error de configuración: ${error.message}`;
        
        return new AppError(message, 500, true, 'config');
    }

    /**
     * Maneja errores de auditoría
     */
    static handleAuditError(error: any, operation?: string): AppError {
        const message = operation 
            ? `Error de auditoría en operación ${operation}: ${error.message}`
            : `Error de auditoría: ${error.message}`;
        
        return new AppError(message, 500, true, 'audit');
    }

    /**
     * Convierte cualquier error en AppError
     */
    static normalizeError(error: any, context?: string): AppError {
        if (error instanceof AppError) {
            return error;
        }

        if (error instanceof Error) {
            return new AppError(
                error.message,
                500,
                false,
                context
            );
        }

        return new AppError(
            'Error interno del servidor',
            500,
            false,
            context
        );
    }

    /**
     * Logs estructurado de errores
     */
    static logError(error: AppError, additionalInfo?: any): void {
        const logData = {
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                statusCode: error.statusCode,
                context: error.context,
                isOperational: error.isOperational,
                stack: error.stack
            },
            ...additionalInfo
        };

        if (error.statusCode >= 500) {
            console.error('Server Error:', JSON.stringify(logData, null, 2));
        } else {
            console.warn('Client Error:', JSON.stringify(logData, null, 2));
        }
    }

    /**
     * Middleware de manejo de errores para Express
     */
    static errorMiddleware = (error: any, req: any, res: any, next: any) => {
        const normalizedError = this.normalizeError(error, req.route?.path);
        
        this.logError(normalizedError, {
            request: {
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: req.body
            }
        });

        res.status(normalizedError.statusCode).json({
            error: {
                message: normalizedError.message,
                statusCode: normalizedError.statusCode,
                context: normalizedError.context,
                timestamp: new Date().toISOString()
            }
        });
    };

    /**
     * Wrapper para operaciones async que maneja errores automáticamente
     */
    static asyncHandler = (fn: Function) => {
        return (req: any, res: any, next: any) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    };
}
