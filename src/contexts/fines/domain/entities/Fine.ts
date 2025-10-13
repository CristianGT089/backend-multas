import { DomainException } from '../../../../shared/index.js';
import {
    FineId,
    PlateNumber,
    EvidenceCID,
    InfractionType,
    Location,
    Cost,
    FineState
} from '../value-objects/index.js';

/**
 * Entidad de dominio: Fine (Multa)
 * Representa una multa de tránsito con toda su lógica de negocio
 */
export class Fine {
    constructor(
        public readonly id: FineId,
        public readonly plateNumber: PlateNumber,
        public readonly evidenceCID: EvidenceCID,
        public readonly location: Location,
        public readonly infractionType: InfractionType,
        public readonly cost: Cost,
        public readonly ownerIdentifier: string,
        public readonly currentState: FineState,
        public readonly registeredBy: string,
        public readonly timestamp: Date,
        public readonly externalSystemId?: string
    ) {
        this.validateBusinessRules();
    }

    private validateBusinessRules(): void {
        if (!this.ownerIdentifier || this.ownerIdentifier.trim().length === 0) {
            throw new DomainException('Owner identifier is required');
        }

        if (!this.registeredBy || this.registeredBy.trim().length === 0) {
            throw new DomainException('RegisteredBy is required');
        }

        if (this.timestamp > new Date()) {
            throw new DomainException('Fine timestamp cannot be in the future');
        }
    }

    /**
     * Factory method: Crea una nueva multa
     */
    static create(params: {
        id: FineId;
        plateNumber: PlateNumber;
        evidenceCID: EvidenceCID;
        location: Location;
        infractionType: InfractionType;
        cost: Cost;
        ownerIdentifier: string;
        registeredBy: string;
        externalSystemId?: string;
    }): Fine {
        return new Fine(
            params.id,
            params.plateNumber,
            params.evidenceCID,
            params.location,
            params.infractionType,
            params.cost,
            params.ownerIdentifier,
            FineState.PENDING, // Estado inicial siempre PENDING
            params.registeredBy,
            new Date(),
            params.externalSystemId
        );
    }

    /**
     * Factory method: Reconstruye una multa desde datos persistidos
     */
    static fromPrimitives(data: {
        id: number;
        plateNumber: string;
        evidenceCID: string;
        location: string;
        infractionType: string;
        cost: number;
        ownerIdentifier: string;
        currentState: number;
        registeredBy: string;
        timestamp: Date | string;
        externalSystemId?: string;
    }): Fine {
        return new Fine(
            FineId.create(data.id),
            PlateNumber.create(data.plateNumber),
            EvidenceCID.create(data.evidenceCID),
            Location.fromString(data.location),
            InfractionType.create(data.infractionType),
            Cost.create(data.cost),
            data.ownerIdentifier,
            FineState.create(data.currentState),
            data.registeredBy,
            typeof data.timestamp === 'string' ? new Date(data.timestamp) : data.timestamp,
            data.externalSystemId
        );
    }

    /**
     * Actualiza el estado de la multa
     * @returns Una nueva instancia de Fine con el estado actualizado (inmutabilidad)
     */
    updateStatus(newState: FineState, reason: string): Fine {
        // Validar que la transición sea válida
        if (!this.currentState.canTransitionTo(newState)) {
            throw new DomainException(
                `Invalid state transition from ${this.currentState.toString()} to ${newState.toString()}`
            );
        }

        // Validar razón
        if (!reason || reason.trim().length === 0) {
            throw new DomainException('State change reason is required');
        }

        if (reason.length > 500) {
            throw new DomainException('State change reason is too long (max 500 characters)');
        }

        // Retornar nueva instancia (inmutabilidad)
        return new Fine(
            this.id,
            this.plateNumber,
            this.evidenceCID,
            this.location,
            this.infractionType,
            this.cost,
            this.ownerIdentifier,
            newState,
            this.registeredBy,
            this.timestamp,
            this.externalSystemId
        );
    }

    /**
     * Marca la multa como pagada
     */
    markAsPaid(): Fine {
        return this.updateStatus(FineState.PAID, 'Fine has been paid');
    }

    /**
     * Inicia un proceso de apelación
     */
    appeal(reason: string): Fine {
        if (!this.canBeAppealed()) {
            throw new DomainException('Fine cannot be appealed in its current state');
        }

        return this.updateStatus(FineState.APPEALED, `Appeal: ${reason}`);
    }

    /**
     * Cancela la multa
     */
    cancel(reason: string): Fine {
        if (this.currentState.isFinalState()) {
            throw new DomainException('Cannot cancel a fine in final state');
        }

        return this.updateStatus(FineState.CANCELLED, reason);
    }

    /**
     * Reglas de negocio: ¿Puede ser apelada?
     */
    canBeAppealed(): boolean {
        return this.currentState.equals(FineState.PENDING) ||
               this.currentState.equals(FineState.PAID);
    }

    /**
     * Reglas de negocio: ¿Está vencida?
     */
    isOverdue(currentDate: Date = new Date()): boolean {
        const DAYS_TO_PAY = 30;
        const dueDate = new Date(this.timestamp);
        dueDate.setDate(dueDate.getDate() + DAYS_TO_PAY);

        return currentDate > dueDate && this.currentState.equals(FineState.PENDING);
    }

    /**
     * Reglas de negocio: ¿Está en un estado final?
     */
    isFinalState(): boolean {
        return this.currentState.isFinalState();
    }

    /**
     * Calcula el costo con recargo por mora si aplica
     */
    calculateCostWithLateFee(currentDate: Date = new Date()): Cost {
        if (!this.isOverdue(currentDate)) {
            return this.cost;
        }

        // 10% de recargo por mora
        const LATE_FEE_PERCENTAGE = 10;
        const lateFee = this.cost.value * (LATE_FEE_PERCENTAGE / 100);
        return Cost.create(this.cost.value + lateFee);
    }

    /**
     * Convierte la entidad a primitivos para persistencia
     */
    toPrimitives(): {
        id: number;
        plateNumber: string;
        evidenceCID: string;
        location: string;
        infractionType: string;
        cost: number;
        ownerIdentifier: string;
        currentState: number;
        registeredBy: string;
        timestamp: Date;
        externalSystemId?: string;
    } {
        return {
            id: this.id.value,
            plateNumber: this.plateNumber.value,
            evidenceCID: this.evidenceCID.value,
            location: this.location.toString(),
            infractionType: this.infractionType.toString(),
            cost: this.cost.value,
            ownerIdentifier: this.ownerIdentifier,
            currentState: this.currentState.value,
            registeredBy: this.registeredBy,
            timestamp: this.timestamp,
            externalSystemId: this.externalSystemId
        };
    }

    /**
     * Compara dos multas por identidad
     */
    equals(other: Fine): boolean {
        return this.id.equals(other.id);
    }
}
