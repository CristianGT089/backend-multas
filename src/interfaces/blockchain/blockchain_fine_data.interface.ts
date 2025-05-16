import { BlockchainFineStatus } from './blockchain_fine_status.interface.js';

export interface BlockchainFineData {
    id: string; // BigInt convertido a string
    fineSIMITId?: string; // ID externo del sistema SIMIT (opcional)
    plateNumber: string;
    ipfsEvidenceHash: string; // CID de IPFS
    offenseType: string;
    location: string;
    offenseTimestamp: string; // Unix timestamp como string
    amount: string; // Costo como string
    status: BlockchainFineStatus; // Estado de la multa
    registrar: string; // Dirección de Ethereum del registrador
    lastUpdated: string; // Unix timestamp de la última actualización
} 