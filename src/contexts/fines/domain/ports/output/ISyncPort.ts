import { Result } from '../../../../../shared/index.js';
import { Fine } from '../../entities/Fine.js';
import { FineId } from '../../value-objects/FineId.js';
import { FineState } from '../../value-objects/FineState.js';

/**
 * Output Port: Blockchain Synchronization
 * Define el contrato para sincronización entre blockchains (Hyperledger ↔ Ethereum)
 */
export interface SyncResult {
    fineId: number;
    hyperledgerTxId: string;
    ethereumTxHash: string;
    timestamp: Date;
    dataHash: string;
}

export interface ConsistencyCheckResult {
    fineId: number;
    isConsistent: boolean;
    hyperledgerData?: any;
    ethereumData?: any;
    differences?: string[];
    lastChecked: Date;
}

export interface ISyncPort {
    /**
     * Sincroniza una multa de Hyperledger a Ethereum
     * Extrae metadatos públicos y los publica en blockchain pública
     */
    syncFineToPublic(fine: Fine): Promise<Result<SyncResult>>;

    /**
     * Sincroniza una actualización de estado entre blockchains
     */
    syncStatusUpdate(
        fineId: FineId,
        newState: FineState,
        reason: string
    ): Promise<Result<SyncResult>>;

    /**
     * Verifica la consistencia de datos entre ambas blockchains
     */
    verifyConsistency(fineId: FineId): Promise<Result<ConsistencyCheckResult>>;

    /**
     * Re-sincroniza una multa (útil si falló la sincronización inicial)
     */
    resyncFine(fineId: FineId): Promise<Result<SyncResult>>;

    /**
     * Obtiene el estado de sincronización de una multa
     */
    getSyncStatus(fineId: FineId): Promise<Result<{
        isSynced: boolean;
        lastSyncAt?: Date;
        pendingOperations: number;
    }>>;

    /**
     * Inicializa el servicio de sincronización
     */
    initialize(): Promise<Result<void>>;

    /**
     * Detiene el servicio de sincronización
     */
    shutdown(): Promise<Result<void>>;
}
