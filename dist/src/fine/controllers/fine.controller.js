import { fineService } from '../services/fine.service.js';
import { FineStateInternal } from '../interfaces/index.js';
/**
 * Registra una multa en la blockBlockchainFineStatuschain y sube la evidencia a IPFS.
 */
export const registerFine = async (req, res, next) => {
    try {
        // Validar datos requeridos
        if (!req.file) {
            return res.status(400).json({ message: "Evidence file is required." });
        }
        if (!req.body.plateNumber || !req.body.location || !req.body.infractionType || req.body.cost === undefined || !req.body.ownerIdentifier) {
            return res.status(400).json({ message: "Missing required fine details." });
        }
        const result = await fineService.registerFine(req.file, req.body);
        res.status(201).json({
            message: 'Fine registered successfully.',
            ...result
        });
    }
    catch (error) {
        console.error("Error in registerFine controller:", error);
        res.status(500).json({ message: 'Error registering fine.', error: error.message });
    }
};
/**
 * Actualiza el estado de una multa en la blockchain.
 */
export const updateFineStatus = async (req, res, next) => {
    try {
        const { fineId } = req.params;
        const { newState, reason } = req.body;
        // Validar datos requeridos
        if (!fineId || newState === undefined || !reason) {
            return res.status(400).json({ message: "Fine ID, new state, and reason are required." });
        }
        // Validar que el estado proporcionado sea válido
        if (!Object.values(FineStateInternal).includes(newState)) {
            return res.status(400).json({ message: "Invalid status provided." });
        }
        const result = await fineService.updateFineStatus(parseInt(fineId, 10), newState, reason);
        res.status(200).json({
            message: 'Fine status updated successfully.',
            ...result
        });
    }
    catch (error) {
        console.error("Error in updateFineStatus controller:", error);
        res.status(500).json({ message: 'Error updating fine status.', error: error.message });
    }
};
/**
 * Obtiene los detalles de una multa desde la blockchain.
 */
export const getFine = async (req, res, next) => {
    try {
        const { fineId } = req.params;
        // Validar datos requeridos
        if (!fineId) {
            return res.status(400).json({ message: "Fine ID is required." });
        }
        // Convertir y validar el ID
        const numericFineId = parseInt(fineId, 10);
        if (isNaN(numericFineId) || numericFineId <= 0) {
            return res.status(400).json({
                message: "Invalid fine ID. Must be a positive number.",
                providedId: fineId
            });
        }
        const fineDetails = await fineService.getFineDetails(numericFineId);
        res.status(200).json(fineDetails);
    }
    catch (error) {
        console.error("Error in getFine controller:", error);
        if (error.message.includes('does not exist')) {
            return res.status(404).json({
                message: 'Fine not found',
                error: error.message
            });
        }
        if (error.message.includes('Invalid fine ID')) {
            return res.status(400).json({
                message: 'Invalid fine ID',
                error: error.message
            });
        }
        res.status(500).json({
            message: 'Error retrieving fine',
            error: error.message
        });
    }
};
/**
 * Obtiene los detalles de todas las multas desde la blockchain.
 */
export const getFines = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        // Validar parámetros de paginación
        if (page < 1 || pageSize < 1) {
            return res.status(400).json({
                message: "Invalid pagination parameters. Page and pageSize must be greater than 0."
            });
        }
        const fines = await fineService.getAllFines(page, pageSize);
        res.status(200).json({
            message: 'Fines retrieved successfully.',
            data: fines,
            pagination: {
                page,
                pageSize
            }
        });
    }
    catch (error) {
        console.error("Error in getFines controller:", error);
        res.status(500).json({ message: 'Error retrieving fines.', error: error.message });
    }
};
/**
 * Obtiene la evidencia de una multa desde IPFS.
 */
export const getFineEvidence = async (req, res, next) => {
    try {
        const { evidenceCID } = req.params;
        // Validar datos requeridos
        if (!evidenceCID) {
            return res.status(400).json({ message: "Evidence CID is required." });
        }
        // Validar formato del CID (acepta tanto v0 como v1)
        if (!/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58})$/.test(evidenceCID)) {
            return res.status(400).json({
                message: "Invalid IPFS CID format. Expected CIDv0 (Qm...) or CIDv1 (b...)",
                providedCID: evidenceCID
            });
        }
        // Recuperar el archivo desde IPFS
        const stream = await fineService.getFineEvidence(evidenceCID);
        // Establecer headers
        res.setHeader('Content-Disposition', `inline; filename="evidence_${evidenceCID}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        // Manejar el streaming con manejo de errores
        try {
            for await (const chunk of stream) {
                if (!res.writableEnded) {
                    res.write(chunk);
                }
            }
            res.end();
        }
        catch (streamError) {
            console.error("Error during file streaming:", streamError);
            if (!res.headersSent) {
                res.status(500).json({
                    message: 'Error streaming file from IPFS.',
                    error: streamError.message
                });
            }
        }
    }
    catch (error) {
        console.error("Error in getFineEvidence controller:", error);
        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: 'Evidence file not found in IPFS.',
                error: error.message
            });
        }
        if (!res.headersSent) {
            res.status(500).json({
                message: 'Error retrieving fine evidence.',
                error: error.message
            });
        }
    }
};
/**
 * Verifica la integridad de la blockchain.
 */
export const verifyBlockchainIntegrity = async (req, res, next) => {
    try {
        const { fineId } = req.params;
        if (!fineId) {
            return res.status(400).json({ message: "Fine ID is required." });
        }
        const integrityResult = await fineService.verifyBlockchainIntegrity(parseInt(fineId, 10));
        res.status(200).json({
            success: true,
            message: integrityResult.isValid ?
                'Blockchain integrity verified successfully.' :
                'Blockchain integrity verification failed.',
            data: integrityResult.details
        });
    }
    catch (error) {
        console.error("Error in verifyBlockchainIntegrity controller:", error);
        res.status(500).json({
            success: false,
            message: 'Error verifying blockchain integrity.',
            error: error.message
        });
    }
};
/**
 * Obtiene datos de multas desde Apitude/SIMIT.
 */
export const getFineFromSIMIT = async (req, res, next) => {
    try {
        const { plateNumber } = req.query;
        // Validar datos requeridos
        if (!plateNumber || typeof plateNumber !== 'string') {
            return res.status(400).json({ message: "Plate number query parameter is required." });
        }
        const simitData = await fineService.getFineFromSIMIT(plateNumber);
        res.status(200).json(simitData);
    }
    catch (error) {
        console.error("Error in getFineFromSIMIT controller:", error);
        res.status(500).json({ message: 'Error fetching fine from SIMIT.', error: error.message });
    }
};
/**
 * Enlaza una multa con un ID de SIMIT.
 */
export const linkFineToSIMIT = async (req, res, next) => {
    try {
        const { fineId } = req.params;
        const { simitId } = req.body;
        const transactionHash = await fineService.linkFineToSIMIT(parseInt(fineId, 10), simitId);
        res.status(200).json({ message: 'Fine linked to SIMIT successfully.', transactionHash });
    }
    catch (error) {
        console.error("Error in linkFineToSIMIT controller:", error);
        res.status(500).json({ message: 'Error linking fine to SIMIT.', error: error.message });
    }
};
/**
 * Obtiene multas por número de placa.
 */
export const getFinesByPlate = async (req, res) => {
    try {
        const { plateNumber } = req.params;
        // Validar datos requeridos
        if (!plateNumber) {
            return res.status(400).json({ message: "Plate number is required." });
        }
        const finesDetails = await fineService.getFinesByPlate(plateNumber);
        res.status(200).json({
            message: `Fines for plate number ${plateNumber} retrieved successfully`,
            data: finesDetails
        });
    }
    catch (error) {
        console.error("Error in getFinesByPlate controller:", error);
        res.status(500).json({
            message: 'Error retrieving fines by plate.',
            error: error.message
        });
    }
};
/**
 * Obtiene el historial de estados de una multa.
 */
export const getFineStatusHistory = async (req, res, next) => {
    try {
        const { fineId } = req.params;
        // Validar datos requeridos
        if (!fineId) {
            return res.status(400).json({ message: "Fine ID is required." });
        }
        const statusHistory = await fineService.getFineStatusHistory(parseInt(fineId, 10));
        res.status(200).json({
            message: 'Fine status history retrieved successfully.',
            data: statusHistory,
        });
    }
    catch (error) {
        console.error("Error in getFineStatusHistory controller:", error);
        res.status(500).json({ message: 'Error retrieving fine status history.', error: error.message });
    }
};
/**
 * Obtiene el histórico de las 10 multas más recientes
 */
export const getRecentFinesHistory = async (req, res, next) => {
    try {
        const recentHistory = await fineService.getRecentFinesHistory();
        res.status(200).json({
            success: true,
            message: recentHistory.length > 0 ? 'Recent fines history retrieved successfully' : 'No fines found in the system',
            data: recentHistory
        });
    }
    catch (error) {
        console.error("Error in getRecentFinesHistory controller:", error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving recent fines history',
            error: error.message
        });
    }
};
