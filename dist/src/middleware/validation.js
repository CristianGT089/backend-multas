import { validationResult } from 'express-validator';
/**
 * Middleware para validar las solicitudes usando express-validator
 * @param validations Array de validaciones a aplicar
 * @returns Middleware que valida y maneja errores
 */
export const validate = (validations) => {
    return async (req, res, next) => {
        // Ejecutar todas las validaciones
        await Promise.all(validations.map(validation => validation.run(req)));
        // Obtener errores de validación
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        // Si hay errores, devolver respuesta con errores
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: errors.array().map(error => ({
                field: error.type === 'field' ? error.path : 'unknown',
                message: error.msg,
                value: error.type === 'field' ? error.value : undefined
            }))
        });
    };
};
/**
 * Middleware para validar archivos subidos
 * @param allowedTypes Tipos MIME permitidos
 * @param maxSize Tamaño máximo en bytes
 * @returns Middleware que valida archivos
 */
export const validateFile = (allowedTypes, maxSize = 5 * 1024 * 1024) => {
    return (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Archivo requerido',
                errors: [{ field: 'file', message: 'No se proporcionó ningún archivo' }]
            });
        }
        // Validar tipo de archivo
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de archivo no permitido',
                errors: [{
                        field: 'file',
                        message: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
                    }]
            });
        }
        // Validar tamaño
        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'Archivo demasiado grande',
                errors: [{
                        field: 'file',
                        message: `El archivo excede el tamaño máximo de ${maxSize / (1024 * 1024)}MB`
                    }]
            });
        }
        next();
    };
};
