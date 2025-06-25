import { vi } from 'vitest';
/**
 * Crea un mock de una clase o función
 * @param implementation Implementación parcial del mock
 * @returns Mock object
 */
export function createMock(implementation = {}) {
    return {
        ...implementation,
    };
}
/**
 * Crea un spy para una función
 * @param fn Función a espiar
 * @returns Spy function
 */
export function createSpy(fn = vi.fn()) {
    return vi.fn(fn);
}
/**
 * Limpia todos los mocks después de cada prueba
 */
export function clearAllMocks() {
    vi.clearAllMocks();
}
/**
 * Genera datos de prueba para una multa
 * @returns Objeto con datos de prueba
 */
export function generateTestFineData() {
    return {
        id: '1',
        licensePlate: 'ABC123',
        location: 'Test Location',
        timestamp: new Date().toISOString(),
        speed: 80,
        speedLimit: 60,
        imageHash: 'QmTest123',
        transactionHash: '0xtest123'
    };
}
//# sourceMappingURL=test-helpers.js.map