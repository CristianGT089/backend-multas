import 'reflect-metadata';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { globalErrorHandler, AppError } from './fine/utils/errorHandler.js';
import { specs } from './config/swagger.js';
// Importar configuración de DI y rutas de arquitectura hexagonal
import { configureFinesDependencies, configureFineRoutes } from './contexts/fines/index.js';
const app = express();
// Configurar dependencias (DI Container)
configureFinesDependencies();
// Configuración de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// Middleware para parsear JSON
app.use(express.json());
// Rutas principales - Arquitectura Hexagonal
app.use('/api/fines', configureFineRoutes());
// Ruta de prueba
app.get('/', (_req, res) => {
    res.json({ message: 'API Fotomultas funcionando correctamente' });
});
// Ruta para errores 404
app.all('*', (req, res, next) => {
    next(new AppError(`No se encontró ${req.originalUrl} en este servidor`, 404));
});
// Middleware global de manejo de errores
app.use(globalErrorHandler);
export default app;
