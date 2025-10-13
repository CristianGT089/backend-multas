import { Result } from '../../../../../shared/index.js';

/**
 * Input Port: Register Fine Use Case
 * Define el contrato para registrar una nueva multa
 */
export interface RegisterFineDTO {
    file: Express.Multer.File;
    plateNumber: string;
    location: string;
    infractionType: string;
    cost: number;
    ownerIdentifier: string;
    registeredBy: string;
    externalSystemId?: string;
}

export interface RegisterFineResponseDTO {
    fineId: number;
    evidenceCID: string;
    transactionHash: string;
    timestamp: Date;
}

export interface IRegisterFineUseCase {
    execute(dto: RegisterFineDTO): Promise<Result<RegisterFineResponseDTO>>;
}
