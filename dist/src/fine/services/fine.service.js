import { ipfsService } from './ipfs.service.js';
import { blockchainService } from './blockchain.service.js';
import { apitudeService } from './apitude.service.js';
class FineService {
    async registerFine(file, fineData) {
        const { plateNumber, location, infractionType, cost, ownerIdentifier, externalSystemId } = fineData;
        // Subir evidencia a IPFS
        const evidenceCID = await ipfsService.uploadToIPFS(file.buffer, file.originalname);
        // Registrar multa en la blockchain
        const result = await blockchainService.registerFine(plateNumber, evidenceCID, location, infractionType, cost, ownerIdentifier, externalSystemId);
        return {
            fineId: result.fineId,
            ipfsHash: evidenceCID,
            transactionHash: result.transactionHash,
        };
    }
    async updateFineStatus(fineId, newState, reason) {
        const transactionHash = await blockchainService.updateFineStatus(fineId, newState, reason);
        return { transactionHash };
    }
    async getFineDetails(fineId) {
        return await blockchainService.getFineDetails(fineId);
    }
    async getAllFines(page, pageSize) {
        return await blockchainService.getFinesDetails(page, pageSize);
    }
    async getFineEvidence(evidenceCID) {
        return await ipfsService.getFromIPFS(evidenceCID);
    }
    async verifyBlockchainIntegrity(fineId) {
        const integrityResult = await blockchainService.verifyBlockchainIntegrity(fineId);
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
        return await apitudeService.fetchFineFromApitude(plateNumber, new Date().toISOString().split('T')[0]);
    }
    async linkFineToSIMIT(fineId, simitId) {
        return await blockchainService.linkFineToSIMIT(fineId, simitId);
    }
    async getFinesByPlate(plateNumber) {
        const fineIds = await blockchainService.getFinesByPlate(plateNumber);
        return await Promise.all(fineIds.map(id => blockchainService.getFineDetails(parseInt(id, 10))));
    }
    async getFineStatusHistory(fineId) {
        return await blockchainService.getFineStatusHistoryFromBlockchain(fineId);
    }
    async getRecentFinesHistory() {
        // Obtener el total de multas
        const totalFines = await blockchainService.getTotalFines();
        if (totalFines === 0) {
            return [];
        }
        // Obtener todas las multas
        const fines = await blockchainService.getFinesDetails(1, Number(totalFines));
        // Array para almacenar todos los cambios de estado
        let allStatusChanges = [];
        // Obtener el historial de estados para cada multa
        for (const fine of fines) {
            const statusHistory = await blockchainService.getFineStatusHistoryFromBlockchain(Number(fine.id));
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
export const fineService = new FineService();
