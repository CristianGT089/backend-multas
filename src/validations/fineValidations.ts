import { body, param, query } from 'express-validator';

/**
 * Validaciones para crear una nueva multa
 */
export const createFineValidations = [
  body('plateNumber')
    .trim()
    .notEmpty()
    .withMessage('La placa es requerida')
    .matches(/^[A-Z]{3}[0-9]{3}$/)
    .withMessage('La placa debe tener el formato AAA123 (3 letras + 3 números)'),
  
  body('infractionType')
    .trim()
    .notEmpty()
    .withMessage('El tipo de infracción es requerido')
    .isIn(['EXCESO_VELOCIDAD', 'SEMAFORO_ROJO', 'SOAT_VENCIDO', 'TECNOMECANICA_VENCIDA', 'OTRO'])
    .withMessage('Tipo de infracción no válido'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('La ubicación es requerida')
    .isLength({ min: 10, max: 200 })
    .withMessage('La ubicación debe tener entre 10 y 200 caracteres'),
  
  body('cost')
    .isFloat({ min: 10000, max: 1000000 })
    .withMessage('El costo debe estar entre $10,000 y $1,000,000'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe tener formato ISO 8601')
];

/**
 * Validaciones para actualizar una multa
 */
export const updateFineValidations = [
  param('fineId')
    .isInt({ min: 1 })
    .withMessage('ID de multa inválido'),
  
  body('status')
    .optional()
    .isIn(['PENDIENTE', 'PAGADA', 'APELADA', 'ANULADA'])
    .withMessage('Estado de multa no válido'),
  
  body('cost')
    .optional()
    .isFloat({ min: 10000, max: 1000000 })
    .withMessage('El costo debe estar entre $10,000 y $1,000,000'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
];

/**
 * Validaciones para obtener multas con filtros
 */
export const getFinesValidations = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  
  query('plateNumber')
    .optional()
    .trim()
    .matches(/^[A-Z]{3}[0-9]{3}$/)
    .withMessage('La placa debe tener el formato AAA123'),
  
  query('status')
    .optional()
    .isIn(['PENDIENTE', 'PAGADA', 'APELADA', 'ANULADA'])
    .withMessage('Estado de multa no válido'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe tener formato ISO 8601'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe tener formato ISO 8601')
];

/**
 * Validaciones para obtener una multa específica
 */
export const getFineValidations = [
  param('fineId')
    .isInt({ min: 1 })
    .withMessage('ID de multa inválido')
];

/**
 * Validaciones para eliminar una multa
 */
export const deleteFineValidations = [
  param('fineId')
    .isInt({ min: 1 })
    .withMessage('ID de multa inválido')
];

/**
 * Validaciones para pagar una multa
 */
export const payFineValidations = [
  param('fineId')
    .isInt({ min: 1 })
    .withMessage('ID de multa inválido'),
  
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('El método de pago es requerido')
    .isIn(['TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'EFECTIVO'])
    .withMessage('Método de pago no válido'),
  
  body('transactionId')
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('El ID de transacción debe tener entre 5 y 50 caracteres')
];

/**
 * Validaciones para apelar una multa
 */
export const appealFineValidations = [
  param('fineId')
    .isInt({ min: 1 })
    .withMessage('ID de multa inválido'),
  
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('La razón de la apelación es requerida')
    .isLength({ min: 20, max: 1000 })
    .withMessage('La razón debe tener entre 20 y 1000 caracteres'),
  
  body('evidence')
    .optional()
    .isArray()
    .withMessage('La evidencia debe ser un array'),
  
  body('evidence.*')
    .optional()
    .isURL()
    .withMessage('Cada evidencia debe ser una URL válida')
]; 