import { Result } from '../../../../../shared/index.js';
import { Fine } from '../../entities/Fine.js';
import { FineId } from '../../value-objects/FineId.js';
import { IBlockchainPort, BlockchainTransactionResult } from './IBlockchainPort.js';

/**
 * Output Port: Ethereum Blockchain
 * Define el contrato específico para operaciones con Ethereum (blockchain pública)
 */
export interface PublicFineMetadata {
    fineId: number;
    plateNumber: string;
    evidenceHash: string;
    location: string;
    infractionType: string;
    cost: number;
    timestamp: Date;
    currentState: number;
    integrityHash: string;
}

export interface IEthereumPort extends IBlockchainPort {
    /**
     * Registra metadatos públicos de una multa en Ethereum
     */
    registerPublicFine(metadata: PublicFineMetadata): Promise<Result<BlockchainTransactionResult>>;

    /**
     * Actualiza el estado público de una multa
     */
    updatePublicStatus(
        fineId: FineId,
        newState: number,
        reason: string
    ): Promise<Result<BlockchainTransactionResult>>;

    /**
     * Consulta pública de multas (sin autenticación)
     */
    citizenQuery(plateNumber: string): Promise<Result<PublicFineMetadata[]>>;

    /**
     * Vincula una multa con el sistema externo SIMIT
     */
    linkToSIMIT(fineId: FineId, simitId: string): Promise<Result<BlockchainTransactionResult>>;
}
