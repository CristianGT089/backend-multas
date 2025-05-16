import express from 'express';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import { ipfsService } from './fine/services/ipfs.service.js';
import { blockchainService } from './fine/services/blockchain.service.js';
import type { Request, Response, NextFunction } from 'express';
import fineRoutes from './fine/routes/fine.routes.js';
import { globalErrorHandler, AppError } from './fine/utils/errorHandler.js';
import { specs } from './config/swagger.js';

const app = express();

// Configuración de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware para parsear JSON
app.use(express.json());

// Rutas principales
app.use('/api/fines', fineRoutes);

// Ruta de prueba
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'API Fotomultas funcionando correctamente' });
});

// Ruta para subir una multa
app.post('/api/fines', upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            throw new AppError('No se proporcionó ninguna imagen', 400);
        }

        const { plateNumber, location, infractionType, cost, ownerIdentifier } = req.body;

        // Validar campos requeridos
        if (!plateNumber || !location || !infractionType || !cost || !ownerIdentifier) {
            throw new AppError('Faltan campos requeridos', 400);
        }

        // Subir imagen a IPFS
        const cid = await ipfsService.uploadToIPFS(req.file.buffer, req.file.originalname);

        // Registrar multa en la blockchain
        const { fineId, transactionHash } = await blockchainService.registerFine(
            plateNumber,
            cid,
            location,
            infractionType,
            Number(cost),
            ownerIdentifier
        );

        res.json({ 
            message: 'Multa registrada exitosamente',
            fineId,
            transactionHash,
            cid
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Error al procesar la multa', 500);
    }
});

// Ruta para obtener una multa por su CID
app.get('/api/fines/:cid', async (req: Request, res: Response) => {
    try {
        const chunks = await ipfsService.getFromIPFS(req.params.cid);
        const buffer = Buffer.concat(chunks);
        res.send(buffer);
    } catch (error) {
        throw new AppError('Error al obtener la multa', 500);
    }
});

// Ruta para asociar una multa con SIMIT
app.put('/api/fines/:fineId/link-simit', async (req: Request, res: Response) => {
    try {
        const { simitId } = req.body;
        if (!simitId) {
            throw new AppError('Se requiere el ID de SIMIT', 400);
        }

        const transactionHash = await blockchainService.linkFineToSIMIT(
            Number(req.params.fineId),
            simitId
        );

        res.json({
            message: 'Multa vinculada con SIMIT exitosamente',
            fineId: req.params.fineId,
            simitId,
            transactionHash
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Error al vincular la multa con SIMIT', 500);
    }
});

// Ruta para errores 404
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`No se encontró ${req.originalUrl} en este servidor`, 404));
});

// Middleware global de manejo de errores
app.use(globalErrorHandler);

export default app;