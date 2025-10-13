import { Result } from '../../../../../shared/index.js';
import { Fine } from '../../entities/Fine.js';
import { FineId } from '../../value-objects/FineId.js';
import { IBlockchainPort, BlockchainTransactionResult } from './IBlockchainPort.js';

/**
 * Output Port: Hyperledger Fabric
 * Define el contrato específico para operaciones con Hyperledger (blockchain privada)
 */
export interface InternalFineData extends Fine {
    driverDetails?: {
        driverLicense: string;
        driverName: string;
    };
    internalNotes?: string;
    appealHistory?: AppealEntry[];
}

export interface AppealEntry {
    appealId: string;
    reason: string;
    evidenceCIDs: string[];
    submittedBy: string;
    submittedAt: Date;
    resolution?: {
        resolvedBy: string;
        resolvedAt: Date;
        decision: 'APPROVED' | 'REJECTED';
        notes: string;
    };
}

export interface AuditEntry {
    id: string;
    operation: 'REGISTER' | 'UPDATE_STATUS' | 'APPEAL' | 'LINK_SIMIT';
    fineId: number;
    performedBy: string;
    timestamp: Date;
    details: Record<string, any>;
    transactionId: string;
}

export interface IHyperledgerPort extends IBlockchainPort {
    /**
     * Registra una multa completa con datos sensibles en Hyperledger
     */
    registerInternalFine(fine: Fine, internalData?: {
        driverDetails?: InternalFineData['driverDetails'];
        internalNotes?: string;
    }): Promise<Result<BlockchainTransactionResult & { fineId: number }>>;

    /**
     * Procesa una apelación de multa
     */
    processAppeal(
        fineId: FineId,
        appeal: Omit<AppealEntry, 'appealId' | 'submittedAt'>
    ): Promise<Result<{ appealId: string; txId: string }>>;

    /**
     * Resuelve una apelación
     */
    resolveAppeal(
        fineId: FineId,
        appealId: string,
        resolution: AppealEntry['resolution']
    ): Promise<Result<BlockchainTransactionResult>>;

    /**
     * Obtiene el historial de auditoría de una multa
     */
    auditTrail(fineId: FineId): Promise<Result<AuditEntry[]>>;

    /**
     * Obtiene los permisos de un usuario
     */
    getUserPermissions(userId: string): Promise<Result<{
        canRegister: boolean;
        canUpdateStatus: boolean;
        canResolveAppeals: boolean;
        canAudit: boolean;
    }>>;
}
