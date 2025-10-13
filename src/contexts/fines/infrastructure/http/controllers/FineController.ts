import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IRegisterFineUseCase } from '../../../domain/ports/input/IRegisterFineUseCase.js';
import type { IGetFineUseCase } from '../../../domain/ports/input/IGetFineUseCase.js';
import type { IUpdateFineStatusUseCase } from '../../../domain/ports/input/IUpdateFineStatusUseCase.js';
import type { IGetAllFinesUseCase } from '../../../domain/ports/input/IGetAllFinesUseCase.js';
import type { IGetFinesByPlateUseCase } from '../../../domain/ports/input/IGetFinesByPlateUseCase.js';
import type { IVerifyIntegrityUseCase } from '../../../domain/ports/input/IVerifyIntegrityUseCase.js';
import type { IGetFineEvidenceUseCase } from '../../../domain/ports/input/IGetFineEvidenceUseCase.js';

/**
 * Controller HTTP para el contexto de Multas
 * Implementa Arquitectura Hexagonal: Input Adapter (HTTP) → Use Cases
 */
@injectable()
export class FineController {
    constructor(
        @inject('IRegisterFineUseCase') private readonly registerFineUseCase: IRegisterFineUseCase,
        @inject('IGetFineUseCase') private readonly getFineUseCase: IGetFineUseCase,
        @inject('IUpdateFineStatusUseCase') private readonly updateFineStatusUseCase: IUpdateFineStatusUseCase,
        @inject('IGetAllFinesUseCase') private readonly getAllFinesUseCase: IGetAllFinesUseCase,
        @inject('IGetFinesByPlateUseCase') private readonly getFinesByPlateUseCase: IGetFinesByPlateUseCase,
        @inject('IVerifyIntegrityUseCase') private readonly verifyIntegrityUseCase: IVerifyIntegrityUseCase,
        @inject('IGetFineEvidenceUseCase') private readonly getFineEvidenceUseCase: IGetFineEvidenceUseCase
    ) {}

    /**
     * POST /api/fines
     * Registra una multa en la blockchain y sube la evidencia a IPFS.
     */
    async registerFine(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validar que el archivo exista
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: "Evidence file is required."
                });
                return;
            }

            // Validar campos requeridos
            const { plateNumber, location, infractionType, cost, ownerIdentifier, registeredBy, externalSystemId } = req.body;

            if (!plateNumber || !location || !infractionType || cost === undefined || !ownerIdentifier || !registeredBy) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fine details (plateNumber, location, infractionType, cost, ownerIdentifier, registeredBy)."
                });
                return;
            }

            // Ejecutar caso de uso
            const result = await this.registerFineUseCase.execute({
                file: req.file,
                plateNumber,
                location,
                infractionType,
                cost: parseFloat(cost),
                ownerIdentifier,
                registeredBy,
                externalSystemId
            });

            if (!result.isSuccess) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to register fine.',
                    error: result.error
                });
                return;
            }

            res.status(201).json({
                success: true,
                message: 'Fine registered successfully.',
                data: result.value
            });
        } catch (error: any) {
            console.error("Error in registerFine controller:", error);
            res.status(500).json({
                success: false,
                message: 'Internal server error registering fine.',
                error: error.message
            });
        }
    }

    /**
     * PUT /api/fines/:fineId/status
     * Actualiza el estado de una multa en la blockchain.
     */
    async updateFineStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { fineId } = req.params;
            const { newState, reason, updatedBy } = req.body;

            // Validar datos requeridos
            if (!fineId || newState === undefined || !reason || !updatedBy) {
                res.status(400).json({
                    success: false,
                    message: "Fine ID, new state, reason, and updatedBy are required."
                });
                return;
            }

            // Ejecutar caso de uso
            const result = await this.updateFineStatusUseCase.execute({
                fineId: parseInt(fineId, 10),
                newState: parseInt(newState, 10),
                reason,
                updatedBy
            });

            if (!result.isSuccess) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to update fine status.',
                    error: result.error
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Fine status updated successfully.',
                data: result.value
            });
        } catch (error: any) {
            console.error("Error in updateFineStatus controller:", error);
            res.status(500).json({
                success: false,
                message: 'Internal server error updating fine status.',
                error: error.message
            });
        }
    }

    /**
     * GET /api/fines/:fineId
     * Obtiene los detalles de una multa desde la blockchain.
     */
    async getFine(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { fineId } = req.params;

            // Validar datos requeridos
            if (!fineId) {
                res.status(400).json({
                    success: false,
                    message: "Fine ID is required."
                });
                return;
            }

            // Convertir y validar el ID
            const numericFineId = parseInt(fineId, 10);
            if (isNaN(numericFineId) || numericFineId <= 0) {
                res.status(400).json({
                    success: false,
                    message: "Invalid fine ID. Must be a positive number.",
                    providedId: fineId
                });
                return;
            }

            // Ejecutar caso de uso
            const result = await this.getFineUseCase.execute(numericFineId);

            if (!result.isSuccess) {
                const statusCode = result.error?.includes('not found') ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    message: 'Failed to get fine.',
                    error: result.error
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Fine retrieved successfully.',
                data: result.value
            });
        } catch (error: any) {
            console.error("Error in getFine controller:", error);
            res.status(500).json({
                success: false,
                message: 'Internal server error retrieving fine.',
                error: error.message
            });
        }
    }

    /**
     * GET /api/fines
     * Obtiene todas las multas con paginación.
     */
    async getFines(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const pageParam = req.query.page as string;
            const pageSizeParam = req.query.pageSize as string;

            const page = pageParam ? parseInt(pageParam) : 1;
            const pageSize = pageSizeParam ? parseInt(pageSizeParam) : 10;

            // Validar parámetros de paginación
            if (page < 1) {
                res.status(400).json({
                    success: false,
                    message: "Page number must be greater than or equal to 1.",
                    providedPage: page
                });
                return;
            }

            if (pageSize < 1 || pageSize > 100) {
                res.status(400).json({
                    success: false,
                    message: "Page size must be between 1 and 100.",
                    providedPageSize: pageSize
                });
                return;
            }

            // Ejecutar caso de uso
            const result = await this.getAllFinesUseCase.execute({ page, pageSize });

            if (!result.isSuccess) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to get fines.',
                    error: result.error
                });
                return;
            }

            const responseData = result.value!;
            res.status(200).json({
                success: true,
                message: 'Fines retrieved successfully.',
                data: responseData.fines,
                pagination: responseData.pagination
            });
        } catch (error: any) {
            console.error("Error in getFines controller:", error);
            res.status(500).json({
                success: false,
                message: 'Internal server error retrieving fines.',
                error: error.message
            });
        }
    }

    /**
     * GET /api/fines/plate/:plateNumber
     * Obtiene multas por número de placa.
     */
    async getFinesByPlate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { plateNumber } = req.params;

            // Validar datos requeridos
            if (!plateNumber) {
                res.status(400).json({
                    success: false,
                    message: "Plate number is required."
                });
                return;
            }

            // Ejecutar caso de uso
            const result = await this.getFinesByPlateUseCase.execute({ plateNumber });

            if (!result.isSuccess) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to get fines by plate.',
                    error: result.error
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: `Fines for plate number ${plateNumber} retrieved successfully.`,
                data: result.value
            });
        } catch (error: any) {
            console.error("Error in getFinesByPlate controller:", error);
            res.status(500).json({
                success: false,
                message: 'Internal server error retrieving fines by plate.',
                error: error.message
            });
        }
    }

    /**
     * GET /api/fines/:fineId/verify
     * Verifica la integridad de la blockchain para una multa.
     */
    async verifyBlockchainIntegrity(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { fineId } = req.params;

            if (!fineId) {
                res.status(400).json({
                    success: false,
                    message: "Fine ID is required."
                });
                return;
            }

            // Ejecutar caso de uso
            const result = await this.verifyIntegrityUseCase.execute({
                fineId: parseInt(fineId, 10)
            });

            if (!result.isSuccess) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to verify integrity.',
                    error: result.error
                });
                return;
            }

            const integrityData = result.value!;
            res.status(200).json({
                success: integrityData.isValid,
                message: integrityData.isValid ?
                    'Blockchain integrity verified successfully.' :
                    'Blockchain integrity verification failed.',
                data: integrityData
            });
        } catch (error: any) {
            console.error("Error in verifyBlockchainIntegrity controller:", error);
            res.status(500).json({
                success: false,
                message: 'Internal server error verifying blockchain integrity.',
                error: error.message
            });
        }
    }

    /**
     * GET /api/fines/evidence/:evidenceCID
     * Obtiene la evidencia de una multa desde IPFS.
     */
    async getFineEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { evidenceCID } = req.params;

            // Validar datos requeridos
            if (!evidenceCID) {
                res.status(400).json({
                    success: false,
                    message: "Evidence CID is required."
                });
                return;
            }

            // Ejecutar caso de uso
            const result = await this.getFineEvidenceUseCase.execute({ evidenceCID });

            if (!result.isSuccess) {
                const statusCode = result.error?.includes('not found') ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    message: 'Failed to get fine evidence.',
                    error: result.error
                });
                return;
            }

            const evidence = result.value!;

            // Establecer headers
            res.setHeader('Content-Disposition', `inline; filename="evidence_${evidenceCID}"`);
            res.setHeader('Content-Type', evidence.mimeType);
            res.setHeader('Content-Length', evidence.size.toString());

            // Enviar datos
            for (const chunk of evidence.data) {
                if (!res.writableEnded) {
                    res.write(chunk);
                }
            }
            res.end();
        } catch (error: any) {
            console.error("Error in getFineEvidence controller:", error);

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Internal server error retrieving fine evidence.',
                    error: error.message
                });
            }
        }
    }
}
