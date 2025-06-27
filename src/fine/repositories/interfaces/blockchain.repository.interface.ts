import { ethers } from 'ethers';
import { IFineStatusUpdate } from '../../interfaces/fine_status_update.interface.js';
import { IFineDetails } from '../../interfaces/fine_details.interface.js';

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