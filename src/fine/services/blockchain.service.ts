import { IFineDetails } from '../interfaces/fine_details.interface.js';
import { BlockchainRepository } from '../repositories/blockchain.repository.js';

export class BlockchainService {
    private static instance: BlockchainService;
    private repository: BlockchainRepository;

    private constructor() {
        this.repository = BlockchainRepository.getInstance();
    }

    public static getInstance(): BlockchainService {
        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }
        return BlockchainService.instance;
    }

    public async registerFine(
        plateNumber: string,
        evidenceCID: string,
        location: string,
        infractionType: string,
        cost: number,
        ownerIdentifier: string,
        externalSystemId: string = ""
    ): Promise<{ fineId: string; transactionHash: string }> {
        return this.repository.registerFine(
            plateNumber,
            evidenceCID,
            location,
            infractionType,
            cost,
            ownerIdentifier,
            externalSystemId
        );
    }

    public async updateFineStatus(
        fineId: number,
        newState: number,
        reason: string
    ): Promise<{ transactionHash: string }> {
        return this.repository.updateFineStatus(fineId, newState, reason);
    }

    public async getFineDetails(fineId: number): Promise<IFineDetails> {
        return this.repository.getFineDetails(fineId);
    }

    public async getFinesDetails(page: number = 1, pageSize: number = 10): Promise<IFineDetails[]> {
        try {
            const contract = this.repository.getContract();
            const fines = await contract.getPaginatedFines(page, pageSize);
            
            return fines.map((fine: any) => ({
                id: fine.id.toString(),
                plateNumber: fine.plateNumber,
                evidenceCID: fine.evidenceCID,
                location: fine.location,
                timestamp: fine.timestamp.toString(),
                infractionType: fine.infractionType,
                cost: fine.cost.toString(),
                ownerIdentifier: fine.ownerIdentifier,
                currentState: fine.currentState.toString(),
                registeredBy: fine.registeredBy,
                externalSystemId: fine.externalSystemId,
                hashImageIPFS: fine.evidenceCID // El CID de IPFS es el hash de la imagen
            }));
        } catch (error) {
            console.error("Error al obtener las multas:", error);
            throw new Error('Error al obtener las multas');
        }
    }

    public async getFinesByPlate(plateNumber: string): Promise<string[]> {
        return this.repository.getFinesByPlate(plateNumber);
    }

    public async linkFineToSIMIT(fineId: number, simitId: string): Promise<string> {
        return this.repository.linkFineToSIMIT(fineId, simitId);
    }
    public async verifyBlockchainIntegrity(fineId: number): Promise<{ isIntegrityValid: boolean; details: { registrationBlock: number; registrationTimestamp: number; statusHistoryLength: number; lastStatusUpdate: number; verificationDetails: string[]; }; }> {
        return this.repository.verifyBlockchainIntegrity(fineId);
    }

    async getFineStatusHistoryFromBlockchain(
        fineId: number,
        page: number = 1,
        pageSize: number = 10
    ): Promise<{ state: number; reason: string; timestamp: string }[]> {
        try {
            const { updates } = await this.repository.getFineStatusHistory(fineId, page, pageSize);
            
            return updates.map(update => ({
                state: update.newState,
                reason: update.reason,
                timestamp: update.lastUpdatedTimestamp
            }));
        } catch (error) {
            console.error("Error al obtener el historial de estados de la multa:", error);
            throw new Error('Error al obtener el historial de estados de la multa');
        }
    }

    public async getTotalFines(): Promise<number> {
        try {
            const contract = this.repository.getContract();
            const totalFines = await contract.getAllFineCount();
            return Number(totalFines);
        } catch (error) {
            console.error("Error al obtener el total de multas:", error);
            throw new Error('Error al obtener el total de multas');
        }
    }
}
