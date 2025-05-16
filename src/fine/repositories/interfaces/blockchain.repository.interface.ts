import { ethers } from 'ethers';

export interface IFineDetails {
    id: string;
    plateNumber: string;
    evidenceCID: string;
    location: string;
    timestamp: string;
    infractionType: string;
    cost: string;
    ownerIdentifier: string;
    currentState: string;
    registeredBy: string;
    externalSystemId: string;
    hashImageIPFS: string;
}

export interface IFineStatusUpdate {
    lastUpdatedTimestamp: string;
    oldState: number;
    newState: number;
    reason: string;
    updatedBy: string;
}

export interface IBlockchainRepository {
    // Métodos de inicialización y verificación
    initialize(): Promise<void>;
    verifyContract(): Promise<void>;
    
    // Métodos de gestión de multas
    registerFine(
        plateNumber: string,
        evidenceCID: string,
        location: string,
        infractionType: string,
        cost: number,
        ownerIdentifier: string,
        externalSystemId?: string
    ): Promise<{ fineId: string; transactionHash: string }>;
    
    updateFineStatus(
        fineId: number,
        newState: number,
        reason: string
    ): Promise<{ transactionHash: string }>;
    
    getFineDetails(fineId: number): Promise<IFineDetails>;
    getFinesDetails(): Promise<IFineDetails[]>;
    getFinesByPlate(plateNumber: string): Promise<string[]>;
    
    // Métodos de integración
    linkFineToSIMIT(fineId: number, simitId: string): Promise<string>;
    verifyBlockchainIntegrity(fineId: number): Promise<{ 
        isIntegrityValid: boolean; 
        details: {
            registrationBlock: number;
            registrationTimestamp: number;
            statusHistoryLength: number;
            lastStatusUpdate: number;
            verificationDetails: string[];
        }
    }>;
    
    // Métodos de utilidad
    getContract(): ethers.Contract;
    getProvider(): ethers.JsonRpcProvider;
    getWallet(): ethers.Wallet;

    getFineStatusHistory(
        fineId: number,
        page?: number,
        pageSize?: number
    ): Promise<{ updates: IFineStatusUpdate[]; totalUpdates: number }>;
} 