import { Result } from '../../../../../shared/index.js';

/**
 * Input Port: Update Fine Status Use Case
 * Define el contrato para actualizar el estado de una multa
 */
export interface UpdateFineStatusDTO {
    fineId: number;
    newState: number;
    reason: string;
    updatedBy: string;
}

export interface UpdateFineStatusResponseDTO {
    fineId: number;
    previousState: number;
    newState: number;
    transactionHash: string;
    timestamp: Date;
}

export interface IUpdateFineStatusUseCase {
    execute(dto: UpdateFineStatusDTO): Promise<Result<UpdateFineStatusResponseDTO>>;
}
