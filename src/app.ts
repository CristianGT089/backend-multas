import express from 'express';
import swaggerUi from 'swagger-ui-express';
import type { Request, Response, NextFunction } from 'express';
import fineRoutes from './fine/routes/fine.routes.js';
import { globalErrorHandler, AppError } from './fine/utils/errorHandler.js';
import { specs } from './config/swagger.js';

const app = express();

// Configuración de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware para parsear JSON
app.use(express.json());

// Rutas principales
app.use('/api/fines', fineRoutes);

// Ruta de prueba
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'API Fotomultas funcionando correctamente' });
});

// Ruta para errores 404
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`No se encontró ${req.originalUrl} en este servidor`, 404));
});

// Middleware global de manejo de errores
app.use(globalErrorHandler);

export default app;