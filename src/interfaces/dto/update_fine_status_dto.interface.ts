import { BlockchainFineStatus } from '../blockchain/blockchain_fine_status.interface.js';

export interface UpdateFineStatusDto {
    newState: BlockchainFineStatus;
    reason: string;
} 