/**
 * Crea un mock de una clase o función
 * @param implementation Implementación parcial del mock
 * @returns Mock object
 */
export declare function createMock<T extends object>(implementation?: Partial<T>): T;
/**
 * Crea un spy para una función
 * @param fn Función a espiar
 * @returns Spy function
 */
export declare function createSpy<T extends (...args: any[]) => any>(fn?: T): T;
/**
 * Limpia todos los mocks después de cada prueba
 */
export declare function clearAllMocks(): void;
/**
 * Genera datos de prueba para una multa
 * @returns Objeto con datos de prueba
 */
export declare function generateTestFineData(): {
    id: string;
    licensePlate: string;
    location: string;
    timestamp: string;
    speed: number;
    speedLimit: number;
    imageHash: string;
    transactionHash: string;
};
