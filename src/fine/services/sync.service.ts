/**
 * Sync Service para Arquitectura Híbrida Blockchain
 * Maneja la sincronización entre Hyperledger Fabric y Ethereum
 */

import { 
    SyncResult, 
    SyncOperation, 
    IntegrityResult, 
    InternalFineData, 
    PublicFineMetadata,
    FineStatus 
} from '../interfaces/hybrid-fine.interface.js';
import { HyperledgerService } from './hyperledger.service.js';
import { EthereumService } from './ethereum.service.js';
import { HybridErrorHandler } from '../utils/hybrid-error-handler.js';
import { hybridConfig } from '../../config/hybrid.config.js';

export class SyncService {
    private hyperledgerService: HyperledgerService;
    private ethereumService: EthereumService;
    private auditService: any; // Se definirá más adelante
    private syncQueue: SyncOperation[] = [];
    private isRunning: boolean = false;
    private syncInterval: NodeJS.Timeout | null = null;

    constructor(
        hyperledgerService: HyperledgerService,
        ethereumService: EthereumService,
        auditService?: any
    ) {
        this.hyperledgerService = hyperledgerService;
        this.ethereumService = ethereumService;
        this.auditService = auditService;
    }

    /**
     * Inicializa el servicio de sincronización
     */
    async initialize(): Promise<void> {
        try {
            if (!hybridConfig.sync.enabled) {
                console.log('Sync service is disabled');
                return;
            }

            // Verificar que ambos servicios estén conectados
            const hyperledgerConnected = await this.hyperledgerService.isConnected();
            const ethereumConnected = await this.ethereumService.isConnected();

            if (!hyperledgerConnected) {
                throw new Error('HyperledgerService no está conectado');
            }
            if (!ethereumConnected) {
                throw new Error('EthereumService no está conectado');
            }

            // Iniciar el proceso de sincronización automática
            this.startSyncProcess();
            
            console.log('SyncService initialized successfully');
        } catch (error) {
            throw HybridErrorHandler.handleSyncError(error, 'SyncService.initialize');
        }
    }

    /**
     * Sincroniza una multa desde Hyperledger a Ethereum
     */
    async syncFineToPublic(fineId: string): Promise<SyncResult> {
        try {
            console.log(`Starting sync of fine ${fineId} from Hyperledger to Ethereum`);

            // Obtener datos completos desde Hyperledger
            const internalFine = await this.hyperledgerService.getInternalFineDetails(fineId);
            
            // Crear metadatos públicos (sin datos sensibles)
            const publicMetadata: PublicFineMetadata = {
                fineId: internalFine.id,
                plateNumber: internalFine.plateNumber,
                evidenceHash: internalFine.evidenceCID, // En producción, esto sería un hash
                location: internalFine.location,
                infractionType: internalFine.infractionType,
                cost: internalFine.cost,
                timestamp: internalFine.timestamp,
                status: internalFine.currentState,
                integrityHash: this.hyperledgerService.generateInternalHash(internalFine),
                registeredBy: internalFine.registeredBy
            };

            // Registrar en Ethereum
            const ethereumTxHash = await this.ethereumService.registerPublicFine(publicMetadata);

            const syncResult: SyncResult = {
                success: true,
                fineId: fineId,
                fromBlockchain: 'hyperledger',
                toBlockchain: 'ethereum',
                transactionHashes: {
                    hyperledger: 'internal_tx', // Se obtendría del registro interno
                    ethereum: ethereumTxHash
                },
                timestamp: Date.now()
            };

            // Registrar en auditoría
            if (this.auditService) {
                await this.auditService.auditOperation(
                    'SYNC_TO_PUBLIC',
                    fineId,
                    'system',
                    syncResult
                );
            }

            console.log(`Successfully synced fine ${fineId} to Ethereum`);
            return syncResult;

        } catch (error) {
            const syncResult: SyncResult = {
                success: false,
                fineId: fineId,
                fromBlockchain: 'hyperledger',
                toBlockchain: 'ethereum',
                transactionHashes: {},
                timestamp: Date.now(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            console.error(`Failed to sync fine ${fineId}:`, error);
            throw HybridErrorHandler.handleSyncError(error, fineId);
        }
    }

    /**
     * Sincroniza actualización de estado entre blockchains
     */
    async syncStatusUpdate(fineId: string, newStatus: FineStatus, reason: string, updatedBy: string): Promise<SyncResult> {
        try {
            console.log(`Starting status sync for fine ${fineId}`);

            // Actualizar en Hyperledger (datos internos)
            const hyperledgerTxHash = await this.hyperledgerService.updateFineStatus(
                fineId,
                newStatus,
                reason,
                updatedBy
            );

            // Actualizar en Ethereum (metadatos públicos)
            const ethereumTxHash = await this.ethereumService.updateFineStatus(
                fineId,
                newStatus,
                reason
            );

            const syncResult: SyncResult = {
                success: true,
                fineId: fineId,
                fromBlockchain: 'hyperledger',
                toBlockchain: 'ethereum',
                transactionHashes: {
                    hyperledger: hyperledgerTxHash,
                    ethereum: ethereumTxHash
                },
                timestamp: Date.now()
            };

            // Registrar en auditoría
            if (this.auditService) {
                await this.auditService.auditOperation(
                    'SYNC_STATUS_UPDATE',
                    fineId,
                    updatedBy,
                    syncResult
                );
            }

            console.log(`Successfully synced status update for fine ${fineId}`);
            return syncResult;

        } catch (error) {
            console.error(`Failed to sync status update for fine ${fineId}:`, error);
            throw HybridErrorHandler.handleSyncError(error, fineId);
        }
    }

    /**
     * Verifica la consistencia de datos entre blockchains
     */
    async verifyDataConsistency(fineId: string): Promise<IntegrityResult> {
        try {
            console.log(`Verifying data consistency for fine ${fineId}`);

            // Obtener datos desde ambas blockchains
            const internalFine = await this.hyperledgerService.getInternalFineDetails(fineId);
            const publicFine = await this.ethereumService.getPublicFineDetails(fineId);

            // Generar hashes de verificación
            const hyperledgerHash = this.hyperledgerService.generateInternalHash(internalFine);
            const ethereumHash = this.ethereumService.generateIntegrityHash(publicFine);

            // Verificar consistencia
            const isValid = hyperledgerHash === ethereumHash;
            const mismatchFields: string[] = [];

            if (!isValid) {
                // Identificar campos que no coinciden
                if (internalFine.plateNumber !== publicFine.plateNumber) {
                    mismatchFields.push('plateNumber');
                }
                if (internalFine.location !== publicFine.location) {
                    mismatchFields.push('location');
                }
                if (internalFine.infractionType !== publicFine.infractionType) {
                    mismatchFields.push('infractionType');
                }
                if (internalFine.cost !== publicFine.cost) {
                    mismatchFields.push('cost');
                }
                if (internalFine.currentState !== publicFine.status) {
                    mismatchFields.push('status');
                }
            }

            const integrityResult: IntegrityResult = {
                isValid,
                hyperledgerHash,
                ethereumHash,
                mismatchFields,
                lastSyncTimestamp: Date.now()
            };

            console.log(`Data consistency check completed for fine ${fineId}: ${isValid ? 'VALID' : 'INVALID'}`);
            return integrityResult;

        } catch (error) {
            console.error(`Failed to verify data consistency for fine ${fineId}:`, error);
            throw HybridErrorHandler.handleSyncError(error, fineId);
        }
    }

    /**
     * Agrega una operación a la cola de sincronización
     */
    async enqueueSyncOperation(operation: SyncOperation): Promise<void> {
        try {
            this.syncQueue.push(operation);
            console.log(`Added sync operation ${operation.id} to queue`);
        } catch (error) {
            console.error('Failed to enqueue sync operation:', error);
            throw error;
        }
    }

    /**
     * Procesa la cola de sincronización
     */
    private async processSyncQueue(): Promise<void> {
        if (this.syncQueue.length === 0) {
            return;
        }

        const operation = this.syncQueue.shift();
        if (!operation) {
            return;
        }

        try {
            console.log(`Processing sync operation ${operation.id}`);

            let result: SyncResult;

            switch (operation.operation) {
                case 'REGISTER':
                    result = await this.syncFineToPublic(operation.fineId);
                    break;
                case 'UPDATE_STATUS':
                    // Para actualización de estado, necesitaríamos más parámetros
                    result = await this.syncStatusUpdate(
                        operation.fineId,
                        FineStatus.PENDING, // Se obtendría del contexto
                        'Status update',
                        'system'
                    );
                    break;
                case 'APPEAL':
                    // Implementar sincronización de apelaciones
                    result = {
                        success: true,
                        fineId: operation.fineId,
                        fromBlockchain: 'hyperledger',
                        toBlockchain: 'ethereum',
                        transactionHashes: {},
                        timestamp: Date.now()
                    };
                    break;
                default:
                    throw new Error(`Unknown sync operation: ${operation.operation}`);
            }

            operation.status = 'COMPLETED';
            operation.processedAt = Date.now();

            console.log(`Successfully processed sync operation ${operation.id}`);

        } catch (error) {
            operation.status = 'FAILED';
            operation.error = error instanceof Error ? error.message : 'Unknown error';
            operation.processedAt = Date.now();

            console.error(`Failed to process sync operation ${operation.id}:`, error);

            // Reintentar si no se ha excedido el límite
            if (operation.retryCount < operation.maxRetries) {
                operation.retryCount++;
                operation.status = 'PENDING';
                this.syncQueue.push(operation); // Volver a agregar a la cola
                console.log(`Retrying sync operation ${operation.id} (attempt ${operation.retryCount})`);
            }
        }
    }

    /**
     * Inicia el proceso de sincronización automática
     */
    private startSyncProcess(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.syncInterval = setInterval(async () => {
            try {
                await this.processSyncQueue();
            } catch (error) {
                console.error('Error in sync process:', error);
            }
        }, hybridConfig.sync.interval);

        console.log('Sync process started');
    }

    /**
     * Detiene el proceso de sincronización automática
     */
    private stopSyncProcess(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        this.isRunning = false;
        console.log('Sync process stopped');
    }

    /**
     * Obtiene estadísticas de sincronización
     */
    getSyncStats(): {
        queueLength: number;
        isRunning: boolean;
        pendingOperations: number;
        failedOperations: number;
    } {
        const pendingOps = this.syncQueue.filter(op => op.status === 'PENDING').length;
        const failedOps = this.syncQueue.filter(op => op.status === 'FAILED').length;

        return {
            queueLength: this.syncQueue.length,
            isRunning: this.isRunning,
            pendingOperations: pendingOps,
            failedOperations: failedOps
        };
    }

    /**
     * Cierra el servicio de sincronización
     */
    async shutdown(): Promise<void> {
        try {
            this.stopSyncProcess();
            console.log('SyncService shut down successfully');
        } catch (error) {
            console.error('Error during SyncService shutdown:', error);
        }
    }
}
