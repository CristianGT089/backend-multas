/**
 * Excepción para errores de validación
 * Se lanza cuando los datos de entrada no cumplen con las reglas de validación
 */
export class ValidationException extends Error {
    constructor(
        message: string,
        public readonly errors?: Record<string, string[]>
    ) {
        super(message);
        this.name = 'ValidationException';
        Error.captureStackTrace(this, this.constructor);
    }
}
