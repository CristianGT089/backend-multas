/**
 * Interfaces para Arquitectura Híbrida Blockchain
 * Combina Hyperledger Fabric (privada) con Ethereum (pública)
 */

// Datos completos almacenados en Hyperledger Fabric (privada)
export interface InternalFineData {
    id: string;
    plateNumber: string;
    evidenceCID: string;
    location: string;
    infractionType: string;
    cost: number;
    ownerIdentifier: string;
    currentState: FineStatus;
    registeredBy: string;
    externalSystemId?: string;
    timestamp: number;
    
    // Datos sensibles (solo en blockchain privada)
    driverDetails: DriverDetails;
    internalNotes: string;
    appealHistory: AppealEntry[];
    auditTrail: AuditEntry[];
}

// Metadatos públicos almacenados en Ethereum (pública)
export interface PublicFineMetadata {
    fineId: string;
    plateNumber: string;
    evidenceHash: string; // Hash de la evidencia para verificación
    location: string;
    infractionType: string;
    cost: number;
    timestamp: number;
    status: FineStatus;
    integrityHash: string; // Hash de verificación de integridad
    registeredBy: string; // Solo ID público, no datos sensibles
}

// Datos del conductor (sensibles)
export interface DriverDetails {
    fullName: string;
    documentNumber: string;
    address: string;
    phoneNumber: string;
    email: string;
    licenseNumber: string;
    licenseExpiry: string;
}

// Entrada de apelación
export interface AppealEntry {
    id: string;
    fineId: string;
    appealDate: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewedBy?: string;
    reviewDate?: number;
    reviewNotes?: string;
}

// Entrada de auditoría
export interface AuditEntry {
    id: string;
    operation: string;
    fineId: string;
    userId: string;
    timestamp: number;
    details: any;
    blockchain: 'hyperledger' | 'ethereum';
    transactionHash: string;
}

// Estados de multa unificados
export enum FineStatus {
    PENDING = 0,
    PAID = 1,
    APPEALED = 2,
    RESOLVED_APPEAL = 3,
    CANCELLED = 4
}

// Resultado de verificación de integridad
export interface IntegrityResult {
    isValid: boolean;
    hyperledgerHash: string;
    ethereumHash: string;
    mismatchFields?: string[];
    lastSyncTimestamp?: number;
}

// Resultado de sincronización
export interface SyncResult {
    success: boolean;
    fineId: string;
    fromBlockchain: 'hyperledger' | 'ethereum';
    toBlockchain: 'hyperledger' | 'ethereum';
    transactionHashes: {
        hyperledger?: string;
        ethereum?: string;
    };
    timestamp: number;
    error?: string;
}

// Operación de sincronización
export interface SyncOperation {
    id: string;
    fineId: string;
    operation: 'REGISTER' | 'UPDATE_STATUS' | 'APPEAL' | 'CANCEL';
    priority: 'HIGH' | 'NORMAL' | 'LOW';
    retryCount: number;
    maxRetries: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    createdAt: number;
    processedAt?: number;
    error?: string;
}

// Configuración de blockchain híbrida
export interface HybridBlockchainConfig {
    hyperledger: {
        networkName: string;
        channelName: string;
        chaincodeName: string;
        peerEndpoints: string[];
        caEndpoint: string;
        adminUser: string;
        adminPassword: string;
    };
    ethereum: {
        rpcUrl: string;
        privateKey: string;
        contractAddress: string;
        gasLimit: number;
        gasPrice: string;
    };
    sync: {
        enabled: boolean;
        interval: number;
        timeout: number;
        retryAttempts: number;
    };
}

// Datos de consulta ciudadana (solo metadatos públicos)
export interface PublicFineSummary {
    fineId: string;
    plateNumber: string;
    location: string;
    infractionType: string;
    cost: number;
    timestamp: number;
    status: FineStatus;
    evidenceHash: string;
}

// Respuesta de consulta ciudadana
export interface CitizenQueryResult {
    plateNumber: string;
    fines: PublicFineSummary[];
    totalCount: number;
    lastUpdated: number;
}
