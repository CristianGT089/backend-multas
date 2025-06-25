import { IFineDetails } from '../repositories/interfaces/blockchain.repository.interface.js';
declare class BlockchainService {
    private static instance;
    private repository;
    private constructor();
    static getInstance(): BlockchainService;
    registerFine(plateNumber: string, evidenceCID: string, location: string, infractionType: string, cost: number, ownerIdentifier: string, externalSystemId?: string): Promise<{
        fineId: string;
        transactionHash: string;
    }>;
    updateFineStatus(fineId: number, newState: number, reason: string): Promise<{
        transactionHash: string;
    }>;
    getFineDetails(fineId: number): Promise<IFineDetails>;
    getFinesDetails(page?: number, pageSize?: number): Promise<IFineDetails[]>;
    getFinesByPlate(plateNumber: string): Promise<string[]>;
    linkFineToSIMIT(fineId: number, simitId: string): Promise<string>;
    verifyBlockchainIntegrity(fineId: number): Promise<{
        isIntegrityValid: boolean;
        details: {
            registrationBlock: number;
            registrationTimestamp: number;
            statusHistoryLength: number;
            lastStatusUpdate: number;
            verificationDetails: string[];
        };
    }>;
    getFineStatusHistoryFromBlockchain(fineId: number, page?: number, pageSize?: number): Promise<{
        state: number;
        reason: string;
        timestamp: string;
    }[]>;
    getTotalFines(): Promise<number>;
}
export declare const blockchainService: BlockchainService;
export {};
