import { Router } from 'express';
import { container } from 'tsyringe';
import multer from 'multer';
import { FineController } from '../controllers/FineController.js';

// Configurar multer para subida de archivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

/**
 * Configura las rutas HTTP para el contexto de Multas
 */
export function configureFineRoutes(): Router {
    const router = Router();

    // Resolver el controller desde el contenedor DI
    const fineController = container.resolve(FineController);

    // POST - Registrar nueva multa
    router.post(
        '/',
        upload.single('evidence'),
        (req, res, next) => fineController.registerFine(req, res, next)
    );

    // PUT - Actualizar estado de multa
    router.put(
        '/:fineId/status',
        (req, res, next) => fineController.updateFineStatus(req, res, next)
    );

    // GET - Obtener todas las multas (paginado)
    router.get(
        '/',
        (req, res, next) => fineController.getFines(req, res, next)
    );

    // GET - Obtener evidencia por CID
    router.get(
        '/evidence/:evidenceCID',
        (req, res, next) => fineController.getFineEvidence(req, res, next)
    );

    // GET - Obtener multas por placa
    router.get(
        '/plate/:plateNumber',
        (req, res, next) => fineController.getFinesByPlate(req, res, next)
    );

    // GET - Verificar integridad (ambas rutas apuntan al mismo método)
    router.get(
        '/:fineId/verify',
        (req, res, next) => fineController.verifyBlockchainIntegrity(req, res, next)
    );

    router.get(
        '/:fineId/integrity',
        (req, res, next) => fineController.verifyBlockchainIntegrity(req, res, next)
    );

    // GET - Obtener multa específica por ID (debe ir al final para evitar conflictos)
    router.get(
        '/:fineId',
        (req, res, next) => fineController.getFine(req, res, next)
    );

    return router;
}
