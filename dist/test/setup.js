import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import app from '../src/app.js';
import supertest from 'supertest';
// Configuración global para supertest
export const request = supertest(app);
// Hooks globales
beforeAll(async () => {
    // Configuración inicial antes de todas las pruebas
    // Por ejemplo, configurar base de datos de prueba
});
afterAll(async () => {
    // Limpieza después de todas las pruebas
    // Por ejemplo, cerrar conexiones de base de datos
});
beforeEach(async () => {
    // Configuración antes de cada prueba
    // Por ejemplo, limpiar datos de prueba
});
afterEach(async () => {
    // Limpieza después de cada prueba
    // Por ejemplo, restaurar mocks
});
//# sourceMappingURL=setup.js.map