import { ethers } from 'ethers';
import { IBlockchainRepository, IFineDetails } from './interfaces/blockchain.repository.interface.js';
export interface IFineStatusUpdate {
    lastUpdatedTimestamp: string;
    oldState: number;
    newState: number;
    reason: string;
    updatedBy: string;
}
export declare class BlockchainRepository implements IBlockchainRepository {
    private static instance;
    private provider;
    private wallet;
    private contract;
    private isInitialized;
    private constructor();
    static getInstance(): BlockchainRepository;
    initialize(): Promise<void>;
    verifyContract(): Promise<void>;
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
    /**
     * Obtiene el historial de estados de una multa de forma paginada.
     * @param fineId ID de la multa
     * @param page Número de página (comienza en 1)
     * @param pageSize Tamaño de la página
     * @returns Objeto con el historial de estados y el total de actualizaciones
     */
    getFineStatusHistory(fineId: number, page?: number, pageSize?: number): Promise<{
        updates: IFineStatusUpdate[];
        totalUpdates: number;
    }>;
    getContract(): ethers.Contract;
    getProvider(): ethers.JsonRpcProvider;
    getWallet(): ethers.Wallet;
}
