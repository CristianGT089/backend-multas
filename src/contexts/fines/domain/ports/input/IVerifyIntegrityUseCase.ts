import { Result } from '../../../../../shared/index.js';

/**
 * Input Port: Verify Integrity Use Case
 * Define el contrato para verificar la integridad de una multa en blockchain
 */
export interface VerifyIntegrityDTO {
    fineId: number;
}

export interface IntegrityDetailsDTO {
    fineId: number;
    isValid: boolean;
    registrationBlock: number;
    registrationTimestamp: Date;
    statusHistoryLength: number;
    lastStatusUpdate?: Date;
    ethereumTxHash?: string;
    hyperledgerTxId?: string;
    evidenceCID: string;
    dataHash: string;
}

export interface IVerifyIntegrityUseCase {
    execute(dto: VerifyIntegrityDTO): Promise<Result<IntegrityDetailsDTO>>;
}
