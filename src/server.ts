import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err: any) => {
    console.error('Unhandled Rejection:', err.message || err);
    process.exit(1);
});

process.on('uncaughtException', (err: any) => {
    console.error('Uncaught Exception:', err.message || err);
    process.exit(1);
});
