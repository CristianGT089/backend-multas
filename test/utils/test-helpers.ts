import { vi } from 'vitest';

/**
 * Crea un mock de una clase o función
 * @param implementation Implementación parcial del mock
 * @returns Mock object
 */
export function createMock<T extends object>(implementation: Partial<T> = {}): T {
  return {
    ...implementation,
  } as T;
}

/**
 * Crea un spy para una función
 * @param fn Función a espiar
 * @returns Spy function
 */
export function createSpy<T extends (...args: any[]) => any>(fn: T = vi.fn() as any): T {
  return vi.fn(fn) as any;
}

/**
 * Limpia todos los mocks después de cada prueba
 */
export function clearAllMocks(): void {
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