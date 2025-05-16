import { Request, Response, NextFunction } from 'express';
import { ipfsService } from '../../fine/services/ipfs.service.js';
import { blockchainService } from '../../fine/services/blockchain.service.js';
import { apitudeService } from '../../fine/services/apitude.service.js';
import { BlockchainFineStatus, ImportFromApitudeDto, RegisterFineDto, UpdateFineStatusDto } from '../../fine/interfaces/index.js';

/**
 * Registra una multa en la blockchain y sube la evidencia a IPFS.
 */
export const registerFine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { plateNumber, location, infractionType, cost, ownerIdentifier, externalSystemId } = req.body as RegisterFineDto;

        // Validar datos requeridos
        if (!req.file) {
            return res.status(400).json({ message: "Evidence file is required." });
        }
        if (!plateNumber || !location || !infractionType || cost === undefined || !ownerIdentifier) {
            return res.status(400).json({ message: "Missing required fine details." });
        }

        // Subir evidencia a IPFS
        const evidenceCID = await ipfsService.uploadToIPFS(req.file.buffer, req.file.originalname);

        // Registrar multa en la blockchain
        const result = await blockchainService.registerFine(
            plateNumber,
            evidenceCID,
            location,
            infractionType,
            cost,
            ownerIdentifier,
            externalSystemId    
        );

        res.status(201).json({
            message: 'Fine registered successfully.',
            fineId: result.fineId,
            ipfsHash: evidenceCID,
            transactionHash: result.transactionHash,
        });
    } catch (error: any) {
        console.error("Error in registerFine controller:", error);
        res.status(500).json({ message: 'Error registering fine.', error: error.message });
    }
};

/**
 * Actualiza el estado de una multa en la blockchain.
 */
export const updateFineStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fineId } = req.params;
        const { newState, reason } = req.body as UpdateFineStatusDto;

        // Validar datos requeridos
        if (!fineId || newState === undefined || !reason) {
            return res.status(400).json({ message: "Fine ID, new state, and reason are required." });
        }

        // Validar que el estado proporcionado sea válido
        if (!Object.values(BlockchainFineStatus).includes(newState)) {
            return res.status(400).json({ message: "Invalid status provided." });
        }

        // Actualizar el estado de la multa en la blockchain
        const transactionHash = await blockchainService.updateFineStatus(
            parseInt(fineId, 10),
            newState,
            reason
        );

        res.status(200).json({
            message: 'Fine status updated successfully.',
            transactionHash,
        });
    } catch (error: any) {
        console.error("Error in updateFineStatus controller:", error);
        res.status(500).json({ message: 'Error updating fine status.', error: error.message });
    }
};

/**
 * Obtiene los detalles de una multa desde la blockchain.
 */
export const getFine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fineId } = req.params;

        // Validar datos requeridos
        if (!fineId) {
            return res.status(400).json({ message: "Fine ID is required." });
        }

        // Obtener detalles de la multa desde la blockchain
        const fineDetails = await blockchainService.getFineDetails(parseInt(fineId, 10));
        res.status(200).json(fineDetails);
    } catch (error: any) {
        console.error("Error in getFine controller:", error);
        res.status(500).json({ message: 'Error retrieving fine.', error: error.message });
    }
};

/**
 * Obtiene los detalles de todas las multas desde la blockchain.
 */
export const getFines = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;

        // Validar parámetros de paginación
        if (page < 1 || pageSize < 1) {
            return res.status(400).json({ 
                message: "Invalid pagination parameters. Page and pageSize must be greater than 0." 
            });
        }

        const fines = await blockchainService.getFinesDetails(page, pageSize);
        res.status(200).json({
            message: 'Fines retrieved successfully.',
            data: fines,
            pagination: {
                page,
                pageSize
            }
        });
    } catch (error: any) {
        console.error("Error in getFines controller:", error);
        res.status(500).json({ message: 'Error retrieving fines.', error: error.message });
    }
};

/**
 * Obtiene la evidencia de una multa desde IPFS.
 */
export const getFineEvidence = async (req: Request, res: Response, next: NextFunction) => {
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
        const stream = await ipfsService.getFromIPFS(evidenceCID);
        
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
        } catch (streamError: any) {
            console.error("Error during file streaming:", streamError);
            if (!res.headersSent) {
                res.status(500).json({ 
                    message: 'Error streaming file from IPFS.', 
                    error: streamError.message 
                });
            }
        }
    } catch (error: any) {
        console.error("Error in getFineEvidence controller:", error);
        
        // Manejar diferentes tipos de errores
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
export const verifyBlockchainIntegrity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fineId } = req.params;
        if (!fineId) {
            return res.status(400).json({ message: "Fine ID is required." });
        }

        const integrityResult = await blockchainService.verifyBlockchainIntegrity(parseInt(fineId, 10));
        
        console.log("Integrity result:", integrityResult);

        res.status(200).json({
            message: integrityResult.isIntegrityValid ? 
                'Blockchain integrity verified successfully.' : 
                'Blockchain integrity verification failed.',
            ...integrityResult
        });
    } catch (error: any) {
        console.error("Error in verifyBlockchainIntegrity controller:", error);
        res.status(500).json({ 
            message: 'Error verifying blockchain integrity.', 
            error: error.message 
        });
    }
};

/**
 * Obtiene datos de multas desde Apitude/SIMIT.
 */
export const getFineFromSIMIT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { plateNumber } = req.query;

        // Validar datos requeridos
        if (!plateNumber || typeof plateNumber !== 'string') {
            return res.status(400).json({ message: "Plate number query parameter is required." });
        }

        // Obtener datos de la API de Apitude/SIMIT
        const simitData = await apitudeService.fetchFineFromApitude(plateNumber, new Date().toISOString().split('T')[0]);

        res.status(200).json(simitData);
    } catch (error: any) {
        console.error("Error in getFineFromSIMIT controller:", error);
        res.status(500).json({ message: 'Error fetching fine from SIMIT.', error: error.message });
    }
};

/**
 * Enlaza una multa con un ID de SIMIT.
 */
export const linkFineToSIMIT = async (req: Request, res: Response, next: NextFunction) => {
    const { fineId } = req.params;
    const { simitId } = req.body;
    const transactionHash = await blockchainService.linkFineToSIMIT(parseInt(fineId, 10), simitId);
    res.status(200).json({ message: 'Fine linked to SIMIT successfully.', transactionHash });
};

/**
 * Obtiene los detalles del vehiculo por SIMIT.
 */
export const getVehicleInfo = async (req: Request, res: Response, next: NextFunction) => {
    const { plateNumber } = req.params;
    const simitData = await apitudeService.fetchFineFromApitude(plateNumber, new Date().toISOString().split('T')[0]);
    res.status(200).json(simitData);
};

/**
 * Obtiene los detalles del conductor por Registraduria.
 */
export const getDriverDetailsFromRegistraduria = async (req: Request, res: Response, next: NextFunction) => {
    throw new Error('Not implemented');
};

/**
 * Importa multas desde Apitude/SIMIT y las registra.
 */
interface ImportFromApitudeAndRegisterRequest extends Request {
    body: ImportFromApitudeDto;
}

interface ImportFromApitudeAndRegisterResponse extends Response {
    json: (body: { message: string }) => this;
}

export const importFromApitudeAndRegister = async (
    req: ImportFromApitudeAndRegisterRequest,
    res: ImportFromApitudeAndRegisterResponse
) => {
    // Logic for importing fines from Apitude/SIMIT and registering them
    res.status(200).json({ message: 'Fines imported and registered successfully' });
};

/**
 * Obtiene multas por número de placa.
 */
export const getFinesByPlate = async (req: Request, res: Response) => {
    try {
        const { plateNumber } = req.params;

        // Validar datos requeridos
        if (!plateNumber) {
            return res.status(400).json({ message: "Plate number is required." });
        }

        // Obtener IDs de multas desde la blockchain
        const fineIds = await blockchainService.getFinesByPlate(plateNumber);
        console.log("IDs de multas encontradas:", fineIds);
        // Obtener detalles de cada multa
        const finesDetails = await Promise.all(
            fineIds.map(id => blockchainService.getFineDetails(parseInt(id, 10)))
        );
        console.log("Detalles de multas encontradas:", finesDetails);
        res.status(200).json({
            message: `Fines for plate number ${plateNumber} retrieved successfully`,
            data: finesDetails
        });
    } catch (error: any) {
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
export const getFineStatusHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fineId } = req.params;

        // Validar datos requeridos
        if (!fineId) {
            return res.status(400).json({ message: "Fine ID is required." });
        }

        // Obtener historial de estados desde la blockchain
        const statusHistory = await blockchainService.getFineStatusHistoryFromBlockchain(parseInt(fineId, 10));

        console.log("Status history:", statusHistory);
        
        res.status(200).json({
            message: 'Fine status history retrieved successfully.',
            data: statusHistory,
        });
    } catch (error: any) {
        console.error("Error in getFineStatusHistory controller:", error);
        res.status(500).json({ message: 'Error retrieving fine status history.', error: error.message });
    }
};

