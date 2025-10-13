import { injectable } from 'tsyringe';

/**
 * Decorador para marcar casos de uso
 * Combina @injectable de tsyringe con metadata personalizado
 */
export function UseCase(): ClassDecorator {
    return function (target: any) {
        // Aplicar @injectable
        injectable()(target);

        // Agregar metadata personalizado
        Reflect.defineMetadata('isUseCase', true, target);

        return target;
    };
}

/**
 * Verifica si una clase es un caso de uso
 */
export function isUseCase(target: any): boolean {
    return Reflect.getMetadata('isUseCase', target) === true;
}
