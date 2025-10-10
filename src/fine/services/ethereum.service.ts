/**
 * Ethereum Service para Arquitectura Híbrida Blockchain
 * Refactorizado desde BlockchainService para manejar solo operaciones públicas en Ethereum
 */

import { PublicFineMetadata, FineStatus, IntegrityResult, PublicFineSummary, CitizenQueryResult } from '../interfaces/hybrid-fine.interface.js';
import { BlockchainRepository } from '../repositories/blockchain.repository.js';
import { HybridErrorHandler } from '../utils/hybrid-error-handler.js';
import { hybridConfig } from '../../config/hybrid.config.js';

export class EthereumService {
    private repository: BlockchainRepository;
    private isInitialized: boolean = false;

    constructor(repository?: BlockchainRepository) {
        this.repository = repository || BlockchainRepository.getInstance();
    }

    /**
     * Inicializa el servicio Ethereum
     */
    async initialize(): Promise<void> {
        try {
            // Validar configuración
            if (!hybridConfig.ethereum.rpcUrl) {
                throw new Error('ETHEREUM_RPC_URL no está configurado');
            }
            if (!hybridConfig.ethereum.privateKey) {
                throw new Error('ETHEREUM_PRIVATE_KEY no está configurado');
            }
            if (!hybridConfig.ethereum.contractAddress) {
                throw new Error('ETHEREUM_CONTRACT_ADDRESS no está configurado');
            }

            // Verificar conexión
            await this.isConnected();
            this.isInitialized = true;
            
            console.log('EthereumService initialized successfully');
        } catch (error) {
            throw HybridErrorHandler.handleBlockchainError(error, 'EthereumService.initialize');
        }
    }

    /**
     * Verifica si el servicio está conectado a la red Ethereum
     */
    async isConnected(): Promise<boolean> {
        try {
            const contract = this.repository.getContract();
            // Intentar una operación simple para verificar la conexión
            await contract.getAllFineCount();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Registra metadatos públicos de una multa en Ethereum
     */
    async registerPublicFine(metadata: PublicFineMetadata): Promise<string> {
        try {
            if (!this.isInitialized) {
                throw new Error('EthereumService no está inicializado');
            }

            const result = await this.repository.registerFine(
                metadata.plateNumber,
                metadata.evidenceHash, // Usar hash en lugar de CID completo
                metadata.location,
                metadata.infractionType,
                metadata.cost,
                metadata.fineId, // Usar fineId como ownerIdentifier para trazabilidad
                metadata.fineId // Usar fineId como externalSystemId
            );

            return result.transactionHash;
        } catch (error) {
            throw HybridErrorHandler.handleBlockchainError(error, 'EthereumService.registerPublicFine');
        }
    }

    /**
     * Actualiza el estado de una multa en Ethereum
     */
    async updateFineStatus(fineId: string, newStatus: FineStatus, reason: string): Promise<string> {
        try {
            if (!this.isInitialized) {
                throw new Error('EthereumService no está inicializado');
            }

            const result = await this.repository.updateFineStatus(
                parseInt(fineId),
                newStatus,
                reason
            );

            return result.transactionHash;
        } catch (error) {
            throw HybridErrorHandler.handleBlockchainError(error, 'EthereumService.updateFineStatus');
        }
    }

    /**
     * Obtiene detalles públicos de una multa desde Ethereum
     */
    async getPublicFineDetails(fineId: string): Promise<PublicFineMetadata> {
        try {
            if (!this.isInitialized) {
                throw new Error('EthereumService no está inicializado');
            }

            const fineDetails = await this.repository.getFineDetails(parseInt(fineId));
            
            return {
                fineId: fineDetails.id,
                plateNumber: fineDetails.plateNumber,
                evidenceHash: fineDetails.evidenceCID,
                location: fineDetails.location,
                infractionType: fineDetails.infractionType,
                cost: fineDetails.cost,
                timestamp: parseInt(fineDetails.timestamp),
                status: parseInt(fineDetails.currentState) as FineStatus,
                integrityHash: fineDetails.hashImageIPFS,
                registeredBy: fineDetails.registeredBy
            };
        } catch (error) {
            throw HybridErrorHandler.handleBlockchainError(error, 'EthereumService.getPublicFineDetails');
        }
    }

    /**
     * Consulta ciudadana: obtiene multas públicas por placa
     */
    async citizenQuery(plateNumber: string): Promise<CitizenQueryResult> {
        try {
            if (!this.isInitialized) {
                throw new Error('EthereumService no está inicializado');
            }

            const fineIds = await this.repository.getFinesByPlate(plateNumber);
            const fines: PublicFineSummary[] = [];

            for (const fineId of fineIds) {
                try {
                    const fineDetails = await this.getPublicFineDetails(fineId);
                    fines.push({
                        fineId: fineDetails.fineId,
                        plateNumber: fineDetails.plateNumber,
                        location: fineDetails.location,
                        infractionType: fineDetails.infractionType,
                        cost: fineDetails.cost,
                        timestamp: fineDetails.timestamp,
                        status: fineDetails.status,
                        evidenceHash: fineDetails.evidenceHash
                    });
                } catch (error) {
                    console.warn(`Error obteniendo detalles de multa ${fineId}:`, error);
                }
            }

            return {
                plateNumber,
                fines,
                totalCount: fines.length,
                lastUpdated: Date.now()
            };
        } catch (error) {
            throw HybridErrorHandler.handleBlockchainError(error, 'EthereumService.citizenQuery');
        }
    }

    /**
     * Verifica la integridad de una multa en Ethereum
     */
    async verifyFineIntegrity(fineId: string): Promise<IntegrityResult> {
        try {
            if (!this.isInitialized) {
                throw new Error('EthereumService no está inicializado');
            }

            const integrityCheck = await this.repository.verifyBlockchainIntegrity(parseInt(fineId));
            
            return {
                isValid: integrityCheck.isIntegrityValid,
                hyperledgerHash: '', // Se llenará desde HyperledgerService
                ethereumHash: integrityCheck.details.verificationDetails.join('|'),
                mismatchFields: integrityCheck.isIntegrityValid ? [] : ['data_integrity'],
                lastSyncTimestamp: integrityCheck.details.lastStatusUpdate
            };
        } catch (error) {
            throw HybridErrorHandler.handleBlockchainError(error, 'EthereumService.verifyFineIntegrity');
        }
    }

    /**
     * Obtiene el historial de estados de una multa desde Ethereum
     */
    async getFineStatusHistory(fineId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        try {
            if (!this.isInitialized) {
                throw new Error('EthereumService no está inicializado');
            }

            const result = await this.repository.getFineStatusHistory(parseInt(fineId), page, pageSize);
            return result.updates; // Retornar solo el array de updates
        } catch (error) {
            throw HybridErrorHandler.handleBlockchainError(error, 'EthereumService.getFineStatusHistory');
        }
    }

    /**
     * Obtiene el total de multas registradas en Ethereum
     */
    async getTotalFines(): Promise<number> {
        try {
            if (!this.isInitialized) {
                throw new Error('EthereumService no está inicializado');
            }

            const contract = this.repository.getContract();
            const totalFines = await contract.getAllFineCount();
            return Number(totalFines);
        } catch (error) {
            throw HybridErrorHandler.handleBlockchainError(error, 'EthereumService.getTotalFines');
        }
    }

    /**
     * Obtiene multas paginadas desde Ethereum
     */
    async getPaginatedFines(page: number = 1, pageSize: number = 10): Promise<PublicFineSummary[]> {
        try {
            if (!this.isInitialized) {
                throw new Error('EthereumService no está inicializado');
            }

            const contract = this.repository.getContract();
            const fines = await contract.getPaginatedFines(page, pageSize);
            
            return fines.map((fine: any) => ({
                fineId: fine.id.toString(),
                plateNumber: fine.plateNumber,
                location: fine.location,
                infractionType: fine.infractionType,
                cost: fine.cost,
                timestamp: parseInt(fine.timestamp.toString()),
                status: parseInt(fine.currentState.toString()) as FineStatus,
                evidenceHash: fine.evidenceCID
            }));
        } catch (error) {
            throw HybridErrorHandler.handleBlockchainError(error, 'EthereumService.getPaginatedFines');
        }
    }

    /**
     * Vincula una multa con SIMIT en Ethereum
     */
    async linkFineToSIMIT(fineId: string, simitId: string): Promise<string> {
        try {
            if (!this.isInitialized) {
                throw new Error('EthereumService no está inicializado');
            }

            return await this.repository.linkFineToSIMIT(parseInt(fineId), simitId);
        } catch (error) {
            throw HybridErrorHandler.handleBlockchainError(error, 'EthereumService.linkFineToSIMIT');
        }
    }

    /**
     * Genera hash de integridad para metadatos públicos
     */
    generateIntegrityHash(metadata: PublicFineMetadata): string {
        const crypto = require('crypto');
        const dataString = JSON.stringify({
            fineId: metadata.fineId,
            plateNumber: metadata.plateNumber,
            evidenceHash: metadata.evidenceHash,
            location: metadata.location,
            infractionType: metadata.infractionType,
            cost: metadata.cost,
            timestamp: metadata.timestamp,
            status: metadata.status
        });
        
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }

    /**
     * Cierra conexiones y limpia recursos
     */
    async shutdown(): Promise<void> {
        try {
            // Ethereum no requiere shutdown específico, pero podemos limpiar referencias
            this.isInitialized = false;
            console.log('EthereumService shut down successfully');
        } catch (error) {
            console.error('Error during EthereumService shutdown:', error);
        }
    }
}
