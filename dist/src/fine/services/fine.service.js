import { IPFSService } from './ipfs.service.js';
import { BlockchainService } from './blockchain.service.js';
import { SimitService } from './simit.service.js';
export class FineService {
    static instance;
    _ipfsService;
    _blockchainService;
    _simitService;
    constructor() {
        this._ipfsService = IPFSService.getInstance();
        this._blockchainService = BlockchainService.getInstance();
        this._simitService = SimitService.getInstance();
    }
    static getInstance() {
        if (!FineService.instance) {
            FineService.instance = new FineService();
        }
        return FineService.instance;
    }
    async registerFine(file, fineData) {
        const { plateNumber, location, infractionType, cost, ownerIdentifier, externalSystemId } = fineData;
        // Subir evidencia a IPFS
        const evidenceCID = await this._ipfsService.uploadToIPFS(file.buffer, file.originalname);
        // Registrar multa en la blockchain
        const result = await this._blockchainService.registerFine(plateNumber, evidenceCID, location, infractionType, cost, ownerIdentifier, externalSystemId);
        return {
            fineId: result.fineId,
            evidenceCID: evidenceCID,
            transactionHash: result.transactionHash,
        };
    }
    async updateFineStatus(fineId, newState, reason) {
        const transactionHash = await this._blockchainService.updateFineStatus(fineId, newState, reason);
        return { transactionHash };
    }
    async getFineDetails(fineId) {
        return await this._blockchainService.getFineDetails(fineId);
    }
    async getAllFines(page, pageSize) {
        return await this._blockchainService.getFinesDetails(page, pageSize);
    }
    async getFineEvidence(evidenceCID) {
        return await this._ipfsService.getFromIPFS(evidenceCID);
    }
    async verifyBlockchainIntegrity(fineId) {
        const integrityResult = await this._blockchainService.verifyBlockchainIntegrity(fineId);
        return {
            isValid: integrityResult.isIntegrityValid,
            details: {
                registrationBlock: integrityResult.details.registrationBlock,
                registrationTimestamp: integrityResult.details.registrationTimestamp,
                statusHistoryLength: integrityResult.details.statusHistoryLength,
                lastStatusUpdate: integrityResult.details.lastStatusUpdate,
                verificationDetails: integrityResult.details.verificationDetails
            }
        };
    }
    async getFineFromSIMIT(plateNumber) {
        return await this._simitService.getSIMITFineByPlate(plateNumber);
    }
    async linkFineToSIMIT(fineId, simitId) {
        return await this._blockchainService.linkFineToSIMIT(fineId, simitId);
    }
    async getFinesByPlate(plateNumber) {
        const fineIds = await this._blockchainService.getFinesByPlate(plateNumber);
        return await Promise.all(fineIds.map(id => this._blockchainService.getFineDetails(parseInt(id, 10))));
    }
    async getFineStatusHistory(fineId) {
        return await this._blockchainService.getFineStatusHistoryFromBlockchain(fineId);
    }
    async getRecentFinesHistory() {
        // Obtener el total de multas
        const totalFines = await this._blockchainService.getTotalFines();
        if (totalFines === 0) {
            return [];
        }
        // Obtener todas las multas
        const fines = await this._blockchainService.getFinesDetails(1, Number(totalFines));
        // Array para almacenar todos los cambios de estado
        let allStatusChanges = [];
        // Obtener el historial de estados para cada multa
        for (const fine of fines) {
            const statusHistory = await this._blockchainService.getFineStatusHistoryFromBlockchain(Number(fine.id));
            // Agregar cada cambio de estado al array
            statusHistory.forEach(change => {
                allStatusChanges.push({
                    fineId: fine.id,
                    plateNumber: fine.plateNumber,
                    status: change.state,
                    reason: change.reason,
                    timestamp: change.timestamp
                });
            });
            // Agregar el estado inicial
            allStatusChanges.push({
                fineId: fine.id,
                plateNumber: fine.plateNumber,
                status: 0,
                reason: `Multa registrada por ${fine.infractionType} en ${fine.location}`,
                timestamp: fine.timestamp
            });
        }
        // Ordenar y tomar los 10 más recientes
        allStatusChanges.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        const recentChanges = allStatusChanges.slice(0, 10);
        // Formatear la respuesta
        return recentChanges.map(change => ({
            status: Number(change.status),
            reason: change.reason,
            fineId: change.fineId,
            plateNumber: change.plateNumber,
            timestamp: new Date(Number(change.timestamp) * 1000).toISOString()
        }));
    }
}
