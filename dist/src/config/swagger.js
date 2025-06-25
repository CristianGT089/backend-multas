import swaggerJsdoc from 'swagger-jsdoc';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Gestión de Multas',
            version: '1.0.0',
            description: 'API para la gestión de multas utilizando blockchain e IPFS',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Servidor de desarrollo',
            },
        ],
        components: {
            schemas: {
                Fine: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID único de la multa'
                        },
                        plateNumber: {
                            type: 'string',
                            description: 'Número de placa del vehículo'
                        },
                        evidenceCID: {
                            type: 'string',
                            description: 'CID de IPFS de la evidencia'
                        },
                        location: {
                            type: 'string',
                            description: 'Ubicación donde se registró la multa'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha y hora del registro'
                        },
                        infractionType: {
                            type: 'string',
                            description: 'Tipo de infracción'
                        },
                        cost: {
                            type: 'string',
                            description: 'Costo de la multa'
                        },
                        ownerIdentifier: {
                            type: 'string',
                            description: 'Identificador del propietario'
                        },
                        currentState: {
                            type: 'string',
                            enum: ['0', '1', '2', '3', '4'],
                            description: 'Estado actual de la multa (0: PENDING, 1: PAID, 2: APPEALED, 3: RESOLVED_APPEAL, 4: CANCELLED)'
                        },
                        registeredBy: {
                            type: 'string',
                            description: 'Dirección que registró la multa'
                        },
                        externalSystemId: {
                            type: 'string',
                            description: 'ID externo (ej: SIMIT)'
                        },
                        hashImageIPFS: {
                            type: 'string',
                            description: 'Hash de la imagen en IPFS'
                        }
                    }
                },
                FineStatusHistory: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'number',
                            description: 'Estado de la multa'
                        },
                        reason: {
                            type: 'string',
                            description: 'Razón del cambio de estado'
                        },
                        fineId: {
                            type: 'string',
                            description: 'ID de la multa'
                        },
                        plateNumber: {
                            type: 'string',
                            description: 'Número de placa'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha y hora del cambio'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Mensaje de error'
                        },
                        error: {
                            type: 'string',
                            description: 'Detalles del error'
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.ts', './src/fine/routes/*.ts'], // Ruta a los archivos que contienen las anotaciones de Swagger
};
export const specs = swaggerJsdoc(options);
