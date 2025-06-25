import { body } from 'express-validator';
/**
 * Tipos de archivo permitidos para fotos de infracciones
 */
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
];
/**
 * Tamaño máximo para archivos de imagen (5MB)
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
/**
 * Validaciones para subir foto de infracción
 */
export const uploadInfractionPhotoValidations = [
    body('plateNumber')
        .trim()
        .notEmpty()
        .withMessage('Plate number is required')
        .matches(/^[A-Z]{3}[0-9]{3}$/)
        .withMessage('Plate number must have format AAA123 (3 letters + 3 numbers)'),
    body('infractionType')
        .trim()
        .notEmpty()
        .withMessage('Infraction type is required')
        .isIn(['EXCESO_VELOCIDAD', 'SEMAFORO_ROJO', 'ESTACIONAMIENTO_PROHIBIDO', 'OTRO'])
        .withMessage('Invalid infraction type'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required')
        .isLength({ min: 10, max: 200 })
        .withMessage('Location must be between 10 and 200 characters'),
    body('cost')
        .notEmpty()
        .withMessage('Cost is required')
        .isNumeric()
        .withMessage('Cost must be a valid number'),
    body('ownerIdentifier')
        .trim()
        .notEmpty()
        .withMessage('Owner identifier is required')
        .isLength({ min: 8, max: 20 })
        .withMessage('Owner identifier must be between 8 and 20 characters'),
    body('externalSystemId')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('External system ID cannot exceed 50 characters')
];
/**
 * Validaciones para subir múltiples fotos de infracción
 */
export const uploadMultiplePhotosValidations = [
    body('infractions')
        .isArray({ min: 1, max: 10 })
        .withMessage('Debe proporcionar entre 1 y 10 infracciones'),
    body('infractions.*.plateNumber')
        .trim()
        .notEmpty()
        .withMessage('La placa es requerida para cada infracción')
        .matches(/^[A-Z]{3}[0-9]{3}$/)
        .withMessage('La placa debe tener el formato AAA123'),
    body('infractions.*.infractionType')
        .trim()
        .notEmpty()
        .withMessage('El tipo de infracción es requerido para cada infracción')
        .isIn(['EXCESO_VELOCIDAD', 'SEMAFORO_ROJO', 'ESTACIONAMIENTO_PROHIBIDO', 'OTRO'])
        .withMessage('Tipo de infracción no válido'),
    body('infractions.*.location')
        .trim()
        .notEmpty()
        .withMessage('La ubicación es requerida para cada infracción')
        .isLength({ min: 10, max: 200 })
        .withMessage('La ubicación debe tener entre 10 y 200 caracteres'),
    body('infractions.*.date')
        .optional()
        .isISO8601()
        .withMessage('La fecha debe tener formato ISO 8601'),
    body('infractions.*.description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres')
];
