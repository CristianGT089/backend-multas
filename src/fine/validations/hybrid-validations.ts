/**
 * Validaciones Centralizadas para Arquitectura Híbrida Blockchain
 * Proporciona validaciones consistentes para Hyperledger y Ethereum
 */

import Joi from 'joi';
import { FineStatus } from '../interfaces/hybrid-fine.interface.js';

// Validaciones para registro de multas
export const hybridFineValidations = {
    // Validación para registro interno (Hyperledger)
    registerInternalFine: Joi.object({
        plateNumber: Joi.string()
            .pattern(/^[A-Z]{3}[0-9]{3}$/)
            .required()
            .messages({
                'string.pattern.base': 'La placa debe tener formato ABC123',
                'any.required': 'El número de placa es requerido'
            }),
        location: Joi.string()
            .min(5)
            .max(200)
            .required()
            .messages({
                'string.min': 'La ubicación debe tener al menos 5 caracteres',
                'string.max': 'La ubicación no puede exceder 200 caracteres',
                'any.required': 'La ubicación es requerida'
            }),
        infractionType: Joi.string()
            .valid('SPEEDING', 'RED_LIGHT', 'PARKING', 'NO_STOP', 'WRONG_WAY')
            .required()
            .messages({
                'any.only': 'Tipo de infracción no válido',
                'any.required': 'El tipo de infracción es requerido'
            }),
        cost: Joi.number()
            .min(0)
            .max(10000000)
            .required()
            .messages({
                'number.min': 'El costo debe ser mayor a 0',
                'number.max': 'El costo no puede exceder $10,000,000',
                'any.required': 'El costo es requerido'
            }),
        ownerIdentifier: Joi.string()
            .min(8)
            .max(20)
            .required()
            .messages({
                'string.min': 'El identificador del propietario debe tener al menos 8 caracteres',
                'string.max': 'El identificador del propietario no puede exceder 20 caracteres',
                'any.required': 'El identificador del propietario es requerido'
            }),
        evidenceFile: Joi.object({
            buffer: Joi.binary().required(),
            originalname: Joi.string().required(),
            mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/gif').required()
        }).required().messages({
            'any.required': 'El archivo de evidencia es requerido',
            'object.base': 'El archivo de evidencia debe ser un objeto válido'
        }),
        driverDetails: Joi.object({
            fullName: Joi.string().min(2).max(100).required(),
            documentNumber: Joi.string().pattern(/^[0-9]{6,12}$/).required(),
            address: Joi.string().min(10).max(200).required(),
            phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
            email: Joi.string().email().required(),
            licenseNumber: Joi.string().min(5).max(20).required(),
            licenseExpiry: Joi.date().greater('now').required()
        }).required(),
        internalNotes: Joi.string().max(500).optional()
    }),

    // Validación para registro público (Ethereum)
    registerPublicFine: Joi.object({
        fineId: Joi.string().uuid().required(),
        plateNumber: Joi.string().pattern(/^[A-Z]{3}[0-9]{3}$/).required(),
        evidenceHash: Joi.string().length(64).required(), // SHA-256 hash
        location: Joi.string().min(5).max(200).required(),
        infractionType: Joi.string().valid('SPEEDING', 'RED_LIGHT', 'PARKING', 'NO_STOP', 'WRONG_WAY').required(),
        cost: Joi.number().min(0).max(10000000).required(),
        timestamp: Joi.number().integer().positive().required(),
        status: Joi.number().valid(0, 1, 2, 3, 4).required(),
        integrityHash: Joi.string().length(64).required(),
        registeredBy: Joi.string().min(1).max(50).required()
    }),

    // Validación para actualización de estado
    updateStatus: Joi.object({
        fineId: Joi.string().uuid().required(),
        newState: Joi.number().valid(0, 1, 2, 3, 4).required(),
        reason: Joi.string().min(10).max(500).required(),
        updatedBy: Joi.string().min(1).max(50).required()
    }),

    // Validación para apelaciones
    processAppeal: Joi.object({
        fineId: Joi.string().uuid().required(),
        userId: Joi.string().min(1).max(50).required(),
        reason: Joi.string().min(20).max(1000).required(),
        evidence: Joi.string().optional() // CID de evidencia adicional
    }),

    // Validación para sincronización
    syncData: Joi.object({
        fineId: Joi.string().uuid().required(),
        targetBlockchain: Joi.string().valid('ethereum', 'hyperledger').required(),
        operation: Joi.string().valid('REGISTER', 'UPDATE_STATUS', 'APPEAL', 'CANCEL').required(),
        priority: Joi.string().valid('HIGH', 'NORMAL', 'LOW').default('NORMAL')
    }),

    // Validación para consultas ciudadanas
    citizenQuery: Joi.object({
        plateNumber: Joi.string().pattern(/^[A-Z]{3}[0-9]{3}$/).required(),
        includeHistory: Joi.boolean().default(false),
        page: Joi.number().integer().min(1).default(1),
        pageSize: Joi.number().integer().min(1).max(100).default(10)
    }),

    // Validación para verificación de integridad
    verifyIntegrity: Joi.object({
        fineId: Joi.string().uuid().required(),
        blockchain: Joi.string().valid('hyperledger', 'ethereum', 'both').default('both')
    })
};

// Validaciones para configuración
export const configValidations = {
    hyperledger: Joi.object({
        networkName: Joi.string().min(1).required(),
        channelName: Joi.string().min(1).required(),
        chaincodeName: Joi.string().min(1).required(),
        peerEndpoints: Joi.array().items(Joi.string().uri()).min(1).required(),
        caEndpoint: Joi.string().uri().required(),
        adminUser: Joi.string().min(1).required(),
        adminPassword: Joi.string().min(1).required()
    }),

    ethereum: Joi.object({
        rpcUrl: Joi.string().uri().required(),
        privateKey: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required(),
        contractAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
        gasLimit: Joi.number().integer().min(21000).required(),
        gasPrice: Joi.string().pattern(/^[0-9]+$/).required()
    }),

    sync: Joi.object({
        enabled: Joi.boolean().required(),
        interval: Joi.number().integer().min(1000).required(),
        timeout: Joi.number().integer().min(1000).required(),
        retryAttempts: Joi.number().integer().min(1).max(10).required()
    })
};

// Validaciones para archivos
export const fileValidations = {
    evidenceFile: Joi.object({
        fieldname: Joi.string().valid('evidence').required(),
        originalname: Joi.string().pattern(/\.(jpg|jpeg|png|gif)$/i).required(),
        encoding: Joi.string().required(),
        mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/gif').required(),
        size: Joi.number().max(10 * 1024 * 1024).required(), // 10MB max
        buffer: Joi.binary().required()
    })
};

// Validaciones para usuarios y permisos
export const userValidations = {
    createUser: Joi.object({
        userId: Joi.string().min(1).max(50).required(),
        role: Joi.string().valid('admin', 'agent', 'citizen').required(),
        permissions: Joi.array().items(Joi.string()).optional(),
        mspId: Joi.string().min(1).required()
    }),

    updatePermissions: Joi.object({
        userId: Joi.string().min(1).max(50).required(),
        permissions: Joi.array().items(Joi.string()).min(1).required()
    })
};

// Validaciones para auditoría
export const auditValidations = {
    auditQuery: Joi.object({
        fineId: Joi.string().uuid().optional(),
        userId: Joi.string().min(1).max(50).optional(),
        operation: Joi.string().optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
        blockchain: Joi.string().valid('hyperledger', 'ethereum', 'both').default('both'),
        page: Joi.number().integer().min(1).default(1),
        pageSize: Joi.number().integer().min(1).max(100).default(10)
    })
};

// Función helper para validar datos
export function validateData<T>(schema: Joi.ObjectSchema<T>, data: any): { isValid: boolean; data?: T; error?: string } {
    try {
        const { error, value } = schema.validate(data, { abortEarly: false });
        
        if (error) {
            const errorMessages = error.details.map(detail => detail.message).join(', ');
            return {
                isValid: false,
                error: errorMessages
            };
        }

        return {
            isValid: true,
            data: value
        };
    } catch (err) {
        return {
            isValid: false,
            error: 'Error de validación interno'
        };
    }
}

// Función helper para validar múltiples esquemas
export function validateMultipleSchemas(schemas: { [key: string]: Joi.ObjectSchema }, data: { [key: string]: any }): { isValid: boolean; errors: { [key: string]: string } } {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    for (const [key, schema] of Object.entries(schemas)) {
        const result = validateData(schema, data[key]);
        if (!result.isValid) {
            errors[key] = result.error || 'Error de validación';
            isValid = false;
        }
    }

    return { isValid, errors };
}

// Middleware de validación para Express
export function createValidationMiddleware(schema: Joi.ObjectSchema) {
    return (req: any, res: any, next: any) => {
        const result = validateData(schema, req.body);
        
        if (!result.isValid) {
            return res.status(400).json({
                error: 'Datos de entrada inválidos',
                details: result.error
            });
        }

        req.validatedData = result.data;
        next();
    };
}

// Validaciones específicas para tipos de infracción
export const infractionTypeValidations = {
    SPEEDING: Joi.object({
        speedLimit: Joi.number().min(30).max(120).required(),
        detectedSpeed: Joi.number().min(31).required(),
        radarId: Joi.string().optional(),
        tolerance: Joi.number().min(0).max(20).default(5)
    }),

    RED_LIGHT: Joi.object({
        intersectionId: Joi.string().required(),
        lightPhase: Joi.string().valid('RED', 'YELLOW', 'GREEN').required(),
        violationTime: Joi.date().required(),
        cameraId: Joi.string().required()
    }),

    PARKING: Joi.object({
        zoneType: Joi.string().valid('RESTRICTED', 'PAID', 'RESIDENTIAL').required(),
        duration: Joi.number().min(1).required(), // en minutos
        violationType: Joi.string().valid('NO_PAYMENT', 'TIME_EXCEEDED', 'WRONG_ZONE').required()
    })
};

// Validaciones para configuración de red
export const networkValidations = {
    peerEndpoint: Joi.string().pattern(/^grpc:\/\/[a-zA-Z0-9.-]+:\d+$/).required(),
    caEndpoint: Joi.string().pattern(/^https?:\/\/[a-zA-Z0-9.-]+:\d+$/).required(),
    rpcEndpoint: Joi.string().pattern(/^https?:\/\/[a-zA-Z0-9.-]+:\d+$/).required()
};
