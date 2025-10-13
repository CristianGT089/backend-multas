/**
 * Excepción base para errores de dominio
 * Se lanza cuando se viola una regla de negocio
 */
export class DomainException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainException';
        Error.captureStackTrace(this, this.constructor);
    }
}
