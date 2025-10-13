import { BlockchainRepository } from '../repositories/blockchain.repository.js';
export class BlockchainService {
    static instance;
    repository;
    constructor() {
        this.repository = BlockchainRepository.getInstance();
    }
    static getInstance() {
        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }
        return BlockchainService.instance;
    }
    async registerFine(plateNumber, evidenceCID, location, infractionType, cost, ownerIdentifier, externalSystemId = "") {
        return this.repository.registerFine(plateNumber, evidenceCID, location, infractionType, cost, ownerIdentifier, externalSystemId);
    }
    async updateFineStatus(fineId, newState, reason) {
        return this.repository.updateFineStatus(fineId, newState, reason);
    }
    async getFineDetails(fineId) {
        return this.repository.getFineDetails(fineId);
    }
    async getFinesDetails(page = 1, pageSize = 10) {
        try {
            const contract = this.repository.getContract();
            const fines = await contract.getPaginatedFines(page, pageSize);
            return fines.map((fine) => ({
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
        }
        catch (error) {
            console.error("Error al obtener las multas:", error);
            throw new Error('Error al obtener las multas');
        }
    }
    async getFinesByPlate(plateNumber) {
        return this.repository.getFinesByPlate(plateNumber);
    }
    async linkFineToSIMIT(fineId, simitId) {
        return this.repository.linkFineToSIMIT(fineId, simitId);
    }
    async verifyBlockchainIntegrity(fineId) {
        return this.repository.verifyBlockchainIntegrity(fineId);
    }
    async getFineStatusHistoryFromBlockchain(fineId, page = 1, pageSize = 10) {
        try {
            const { updates } = await this.repository.getFineStatusHistory(fineId, page, pageSize);
            return updates.map(update => ({
                state: update.newState,
                reason: update.reason,
                timestamp: update.lastUpdatedTimestamp
            }));
        }
        catch (error) {
            console.error("Error al obtener el historial de estados de la multa:", error);
            throw new Error('Error al obtener el historial de estados de la multa');
        }
    }
    async getTotalFines() {
        try {
            const contract = this.repository.getContract();
            const totalFines = await contract.getAllFineCount();
            return Number(totalFines);
        }
        catch (error) {
            console.error("Error al obtener el total de multas:", error);
            throw new Error('Error al obtener el total de multas');
        }
    }
}
