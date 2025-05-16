import { Router } from 'express';
import * as fineController from '../../fine/controllers/fine.controller.js';
import multer from 'multer';
import { asyncHandler } from '../utils/async.handler.js';

const router = Router();
const storage = multer.memoryStorage(); // Almacena archivos en memoria para subirlos a IPFS
const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/fines:
 *   post:
 *     summary: Registrar una nueva multa
 *     tags: [Multas]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - evidenceFile
 *               - plateNumber
 *               - location
 *               - infractionType
 *               - cost
 *               - ownerIdentifier
 *             properties:
 *               evidenceFile:
 *                 type: string
 *                 format: binary
 *               plateNumber:
 *                 type: string
 *               location:
 *                 type: string
 *               infractionType:
 *                 type: string
 *               cost:
 *                 type: number
 *               ownerIdentifier:
 *                 type: string
 *     responses:
 *       201:
 *         description: Multa registrada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', upload.single('evidenceFile'), asyncHandler(fineController.registerFine));


/**
 * @swagger
 * /api/fines/{fineId}:
 *   get:
 *     summary: Obtener detalles de una multa
 *     tags: [Multas]
 *     parameters:
 *       - in: path
 *         name: fineId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles de la multa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fine'
 *       404:
 *         description: Multa no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:fineId', asyncHandler(fineController.getFine));

/**
 * @swagger
 * /api/fines:
 *   get:
 *     summary: Obtener todas las multas
 *     tags: [Multas]
 *     responses:
 *       200:
 *         description: Lista de multas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fine'
 *       500:
 *         description: Error del servidor
 */
router.get('/', asyncHandler(fineController.getFines));

/**
 * @swagger
 * /api/fines/{fineId}/status:
 *   put:
 *     summary: Actualizar el estado de una multa
 *     tags: [Multas]
 *     parameters:
 *       - in: path
 *         name: fineId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newState
 *               - reason
 *             properties:
 *               newState:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       404:
 *         description: Multa no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:fineId/status', asyncHandler(fineController.updateFineStatus));


/**
 * @swagger
 * /api/fines/{fineId}/integrity:
 *   get:
 *     summary: Verificar la integridad de la blockchain
 *     tags: [Multas]
 *     parameters:
 *       - in: path
 *         name: fineId
 */
router.get('/:fineId/integrity', asyncHandler(fineController.verifyBlockchainIntegrity));

/**
 * @swagger
 * /api/fines/{evidenceCID}/evidence:
 *   get:
 *     summary: Obtener la evidencia de una multa desde IPFS
 *     tags: [Multas]
 *     parameters:
 *       - in: path
 *         name: evidenceCID
 *     responses:
 *       200:
 *         description: Evidencia obtenida exitosamente
 *       404:
 *         description: Evidencia no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:evidenceCID/evidence', asyncHandler(fineController.getFineEvidence));

/**
 * @swagger
 * /api/fines/by-plate/{plateNumber}:
 *   get:
 *     summary: Obtener multas por número de placa
 *     tags: [Multas]
 *     parameters:
 *       - in: path
 *         name: plateNumber
 *     responses:
 *       200:
 *         description: Lista de multas
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.get('/by-plate/:plateNumber', asyncHandler(fineController.getFinesByPlate));

/**
 * @swagger
 * /api/fines/{fineId}/status-history:
 *   get:
 *     summary: Obtener el historial de estados de una multa
 *     tags: [Multas]
 *     parameters:
 *       - in: path
 *         name: fineId
 *     responses:
 *       200:
 *         description: Historial de estados
 *       404:
 *         description: Multa no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:fineId/status-history', asyncHandler(fineController.getFineStatusHistory));

// Ruta para asociar una multa con un ID de SIMIT
router.put('/:fineId/link-simit', asyncHandler(fineController.linkFineToSIMIT));

// Ruta para obtener los detalles del vehiculo
router.get('/:plateNumber/simit', asyncHandler(fineController.getVehicleInfo));

// Ruta para obtener los detalles de un conductor por Registraduria
//router.get('/:documentNumber/registraduria', asyncHandler(fineController.getDriverDetailsFromRegistraduria));

export default router;