import { DomainException } from '../../../../shared/index.js';

/**
 * Value Object: Fine State
 * Representa el estado actual de una multa
 */
export enum FineStateEnum {
    PENDING = 0,
    PAID = 1,
    APPEALED = 2,
    RESOLVED_APPEAL = 3,
    CANCELLED = 4
}

export class FineState {
    private constructor(public readonly value: FineStateEnum) {}

    static create(value: number): FineState {
        if (!Object.values(FineStateEnum).includes(value)) {
            throw new DomainException(
                `Invalid fine state: ${value}. Must be one of: ${Object.values(FineStateEnum).filter(v => typeof v === 'number').join(', ')}`
            );
        }
        return new FineState(value as FineStateEnum);
    }

    static fromEnum(value: FineStateEnum): FineState {
        return new FineState(value);
    }

    static PENDING = new FineState(FineStateEnum.PENDING);
    static PAID = new FineState(FineStateEnum.PAID);
    static APPEALED = new FineState(FineStateEnum.APPEALED);
    static RESOLVED_APPEAL = new FineState(FineStateEnum.RESOLVED_APPEAL);
    static CANCELLED = new FineState(FineStateEnum.CANCELLED);

    equals(other: FineState): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return FineStateEnum[this.value];
    }

    /**
     * Valida si la transición de estado es válida
     */
    canTransitionTo(newState: FineState): boolean {
        const transitions: Record<FineStateEnum, FineStateEnum[]> = {
            [FineStateEnum.PENDING]: [
                FineStateEnum.PAID,
                FineStateEnum.APPEALED,
                FineStateEnum.CANCELLED
            ],
            [FineStateEnum.PAID]: [
                FineStateEnum.APPEALED
            ],
            [FineStateEnum.APPEALED]: [
                FineStateEnum.RESOLVED_APPEAL,
                FineStateEnum.CANCELLED
            ],
            [FineStateEnum.RESOLVED_APPEAL]: [
                FineStateEnum.PAID,
                FineStateEnum.CANCELLED
            ],
            [FineStateEnum.CANCELLED]: []
        };

        return transitions[this.value]?.includes(newState.value) ?? false;
    }

    /**
     * Retorna una descripción legible del estado
     */
    getDescription(): string {
        const descriptions: Record<FineStateEnum, string> = {
            [FineStateEnum.PENDING]: 'Pendiente de pago',
            [FineStateEnum.PAID]: 'Pagada',
            [FineStateEnum.APPEALED]: 'En proceso de apelación',
            [FineStateEnum.RESOLVED_APPEAL]: 'Apelación resuelta',
            [FineStateEnum.CANCELLED]: 'Cancelada'
        };

        return descriptions[this.value];
    }

    /**
     * Indica si la multa está en un estado final
     */
    isFinalState(): boolean {
        return this.value === FineStateEnum.CANCELLED ||
               this.value === FineStateEnum.PAID;
    }
}
