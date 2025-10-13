import { container } from 'tsyringe';
import 'reflect-metadata';

/**
 * Dependency Injection Container
 * Centraliza la configuración de todas las dependencias del sistema
 */
export class DIContainer {
    private static isInitialized = false;

    /**
     * Inicializa el contenedor con todas las dependencias
     */
    static initialize(): void {
        if (this.isInitialized) {
            return;
        }

        // Aquí se registrarán las dependencias en fases posteriores
        // Por ahora dejamos la estructura preparada

        this.isInitialized = true;
    }

    /**
     * Obtiene el contenedor global
     */
    static getContainer() {
        return container;
    }

    /**
     * Resetea el contenedor (útil para testing)
     */
    static reset(): void {
        container.clearInstances();
        this.isInitialized = false;
    }
}

export { container };
