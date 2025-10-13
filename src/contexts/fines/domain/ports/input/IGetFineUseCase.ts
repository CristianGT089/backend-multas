import { Result } from '../../../../../shared/index.js';

/**
 * Input Port: Get Fine Use Case
 * Define el contrato para obtener detalles de una multa
 */
export interface FineDetailsDTO {
    id: number;
    plateNumber: string;
    evidenceCID: string;
    location: string;
    infractionType: string;
    cost: number;
    costWithLateFee?: number;
    ownerIdentifier: string;
    currentState: number;
    stateDescription: string;
    registeredBy: string;
    timestamp: Date;
    externalSystemId?: string;
    isOverdue: boolean;
    canBeAppealed: boolean;
}

export interface IGetFineUseCase {
    execute(fineId: number): Promise<Result<FineDetailsDTO>>;
}
