/**
 * Configuración Dinámica para Arquitectura Híbrida Blockchain
 * Centraliza la configuración de Hyperledger Fabric y Ethereum
 */

// import { HybridBlockchainConfig } from '../interfaces/hybrid-fine.interface.js';

// Configuración temporal hasta que se implementen las interfaces
interface HybridBlockchainConfig {
    hyperledger: {
        networkName: string;
        channelName: string;
        chaincodeName: string;
        peerEndpoints: string[];
        caEndpoint: string;
        adminUser: string;
        adminPassword: string;
    };
    ethereum: {
        rpcUrl: string;
        privateKey: string;
        contractAddress: string;
        gasLimit: number;
        gasPrice: string;
    };
    sync: {
        enabled: boolean;
        interval: number;
        timeout: number;
        retryAttempts: number;
    };
}

export const hybridConfig: HybridBlockchainConfig = {
    hyperledger: {
        networkName: process.env.HYPERLEDGER_NETWORK || 'fotomultas-network',
        channelName: process.env.HYPERLEDGER_CHANNEL || 'fines-channel',
        chaincodeName: process.env.HYPERLEDGER_CHAINCODE || 'fine-management',
        peerEndpoints: process.env.HYPERLEDGER_PEERS?.split(',') || [
            'grpc://localhost:7051',
            'grpc://localhost:9051'
        ],
        caEndpoint: process.env.HYPERLEDGER_CA || 'http://localhost:7054',
        adminUser: process.env.HYPERLEDGER_ADMIN_USER || 'admin',
        adminPassword: process.env.HYPERLEDGER_ADMIN_PASSWORD || 'adminpw'
    },
    ethereum: {
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'http://localhost:8545',
        privateKey: process.env.ETHEREUM_PRIVATE_KEY || '',
        contractAddress: process.env.ETHEREUM_CONTRACT_ADDRESS || '',
        gasLimit: parseInt(process.env.ETHEREUM_GAS_LIMIT || '300000'),
        gasPrice: process.env.ETHEREUM_GAS_PRICE || '20000000000'
    },
    sync: {
        enabled: process.env.SYNC_ENABLED === 'true',
        interval: parseInt(process.env.SYNC_INTERVAL || '30000'),
        timeout: parseInt(process.env.SYNC_TIMEOUT || '10000'),
        retryAttempts: parseInt(process.env.SYNC_RETRY_ATTEMPTS || '3')
    }
};

// Configuración específica para IPFS
export const ipfsConfig = {
    apiUrl: process.env.IPFS_API_URL || 'http://127.0.0.1:5001',
    gatewayUrl: process.env.IPFS_GATEWAY_URL || 'http://127.0.0.1:8080',
    timeout: parseInt(process.env.IPFS_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.IPFS_RETRY_ATTEMPTS || '3')
};

// Configuración de caché
export const cacheConfig = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || '',
        db: parseInt(process.env.REDIS_DB || '0'),
        ttl: parseInt(process.env.REDIS_TTL || '3600')
    },
    memory: {
        maxSize: parseInt(process.env.MEMORY_CACHE_MAX_SIZE || '1000'),
        ttl: parseInt(process.env.MEMORY_CACHE_TTL || '300')
    }
};

// Configuración de colas
export const queueConfig = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || '',
        db: parseInt(process.env.REDIS_QUEUE_DB || '1')
    },
    sync: {
        concurrency: parseInt(process.env.SYNC_QUEUE_CONCURRENCY || '5'),
        attempts: parseInt(process.env.SYNC_QUEUE_ATTEMPTS || '3'),
        backoff: {
            type: process.env.SYNC_QUEUE_BACKOFF_TYPE || 'exponential',
            delay: parseInt(process.env.SYNC_QUEUE_BACKOFF_DELAY || '2000')
        }
    }
};

// Configuración de logging
export const loggingConfig = {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: {
        enabled: process.env.LOG_FILE_ENABLED === 'true',
        path: process.env.LOG_FILE_PATH || 'logs/',
        maxSize: process.env.LOG_FILE_MAX_SIZE || '10m',
        maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES || '5')
    },
    console: {
        enabled: process.env.LOG_CONSOLE_ENABLED !== 'false',
        colorize: process.env.LOG_CONSOLE_COLORIZE === 'true'
    }
};

// Configuración de métricas
export const metricsConfig = {
    enabled: process.env.METRICS_ENABLED === 'true',
    port: parseInt(process.env.METRICS_PORT || '9090'),
    path: process.env.METRICS_PATH || '/metrics',
    collectDefaultMetrics: process.env.METRICS_COLLECT_DEFAULT === 'true',
    customMetrics: {
        transactionDuration: true,
        syncOperations: true,
        errorRates: true,
        cacheHitRate: true
    }
};

// Configuración de seguridad
export const securityConfig = {
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        algorithm: process.env.JWT_ALGORITHM || 'HS256'
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true'
    },
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: process.env.CORS_CREDENTIALS === 'true',
        methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE']
    }
};

// Configuración de APIs externas
export const externalApiConfig = {
    simit: {
        baseUrl: process.env.SIMIT_BASE_URL || 'https://api.simit.com',
        apiKey: process.env.SIMIT_API_KEY || '',
        timeout: parseInt(process.env.SIMIT_TIMEOUT || '10000'),
        retryAttempts: parseInt(process.env.SIMIT_RETRY_ATTEMPTS || '3')
    },
    apitude: {
        baseUrl: process.env.APITUDE_BASE_URL || 'https://apitude.co/api',
        apiKey: process.env.APITUDE_API_KEY || '',
        timeout: parseInt(process.env.APITUDE_TIMEOUT || '10000'),
        retryAttempts: parseInt(process.env.APITUDE_RETRY_ATTEMPTS || '3')
    }
};

// Validación de configuración
export function validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar configuración de Hyperledger
    if (!hybridConfig.hyperledger.networkName) {
        errors.push('HYPERLEDGER_NETWORK es requerido');
    }
    if (!hybridConfig.hyperledger.channelName) {
        errors.push('HYPERLEDGER_CHANNEL es requerido');
    }
    if (!hybridConfig.hyperledger.chaincodeName) {
        errors.push('HYPERLEDGER_CHAINCODE es requerido');
    }
    if (hybridConfig.hyperledger.peerEndpoints.length === 0) {
        errors.push('HYPERLEDGER_PEERS debe tener al menos un endpoint');
    }

    // Validar configuración de Ethereum
    if (!hybridConfig.ethereum.rpcUrl) {
        errors.push('ETHEREUM_RPC_URL es requerido');
    }
    if (!hybridConfig.ethereum.privateKey) {
        errors.push('ETHEREUM_PRIVATE_KEY es requerido');
    }
    if (!hybridConfig.ethereum.contractAddress) {
        errors.push('ETHEREUM_CONTRACT_ADDRESS es requerido');
    }

    // Validar configuración de IPFS
    if (!ipfsConfig.apiUrl) {
        errors.push('IPFS_API_URL es requerido');
    }

    // Validar configuración de sincronización
    if (hybridConfig.sync.enabled && hybridConfig.sync.interval < 1000) {
        errors.push('SYNC_INTERVAL debe ser al menos 1000ms');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Función para obtener configuración específica por entorno
export function getEnvironmentConfig(): string {
    return process.env.NODE_ENV || 'development';
}

// Función para verificar si estamos en modo de desarrollo
export function isDevelopment(): boolean {
    return getEnvironmentConfig() === 'development';
}

// Función para verificar si estamos en modo de producción
export function isProduction(): boolean {
    return getEnvironmentConfig() === 'production';
}

// Función para obtener configuración de base de datos según el entorno
export function getDatabaseConfig() {
    const baseConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'fotomultas',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password'
    };

    if (isProduction()) {
        return {
            ...baseConfig,
            ssl: true,
            pool: {
                min: 5,
                max: 20,
                acquireTimeoutMillis: 60000,
                createTimeoutMillis: 30000,
                destroyTimeoutMillis: 5000,
                idleTimeoutMillis: 30000,
                reapIntervalMillis: 1000,
                createRetryIntervalMillis: 200
            }
        };
    }

    return baseConfig;
}
