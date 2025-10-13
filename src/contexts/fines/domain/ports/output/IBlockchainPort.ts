import { Result } from '../../../../../shared/index.js';
import { Fine } from '../../entities/Fine.js';
import { FineId } from '../../value-objects/FineId.js';
import { FineState } from '../../value-objects/FineState.js';

/**
 * Output Port: Blockchain Repository
 * Define el contrato para operaciones con blockchain (genérico)
 */
export interface BlockchainTransactionResult {
    txHash: string;
    blockNumber?: number;
    timestamp: Date;
}

export interface FineStatusHistory {
    fineId: number;
    oldState: number;
    newState: number;
    reason: string;
    updatedBy: string;
    timestamp: Date;
}

export interface IBlockchainPort {
    /**
     * Registra una nueva multa en blockchain
     */
    registerFine(fine: Fine): Promise<Result<BlockchainTransactionResult & { fineId: number }>>;

    /**
     * Obtiene los detalles de una multa
     */
    getFineById(id: FineId): Promise<Result<Fine>>;

    /**
     * Actualiza el estado de una multa
     */
    updateFineStatus(
        id: FineId,
        newState: FineState,
        reason: string,
        updatedBy: string
    ): Promise<Result<BlockchainTransactionResult>>;

    /**
     * Obtiene el historial de estados de una multa
     */
    getFineStatusHistory(id: FineId): Promise<Result<FineStatusHistory[]>>;

    /**
     * Verifica la integridad de los datos en blockchain
     */
    verifyIntegrity(id: FineId): Promise<Result<{
        isValid: boolean;
        registrationBlock: number;
        registrationTimestamp: Date;
        statusHistoryLength: number;
        dataHash: string;
    }>>;

    /**
     * Obtiene todas las multas con paginación
     */
    getAllFines(page: number, pageSize: number): Promise<Result<Fine[]>>;

    /**
     * Busca multas por número de placa
     */
    getFinesByPlate(plateNumber: string): Promise<Result<Fine[]>>;

    /**
     * Obtiene el número total de multas
     */
    getTotalFines(): Promise<Result<number>>;
}
