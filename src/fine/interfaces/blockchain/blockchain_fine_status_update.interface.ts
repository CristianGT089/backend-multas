import { BlockchainFineStatus } from './blockchain_fine_status.interface.js';

export interface BlockchainFineStatusUpdate {
    timestamp: string; // Unix timestamp como string
    oldState: BlockchainFineStatus;
    newState: BlockchainFineStatus;
    reason: string; // Razón del cambio de estado
    updatedBy: string; // Dirección de Ethereum del operador
} 