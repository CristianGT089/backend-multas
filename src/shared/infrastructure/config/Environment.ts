import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración de variables de entorno
 * Centraliza el acceso a todas las variables de configuración
 */
export class Environment {
    // Node Environment
    static readonly NODE_ENV = process.env.NODE_ENV || 'development';
    static readonly PORT = parseInt(process.env.PORT || '3000', 10);

    // Blockchain - Ethereum
    static readonly ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'http://127.0.0.1:8545';
    static readonly PRIVATE_KEY = process.env.PRIVATE_KEY || '';
    static readonly CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';

    // Blockchain - Hyperledger Fabric
    static readonly FABRIC_NETWORK_NAME = process.env.FABRIC_NETWORK_NAME || 'fotomultas-channel';
    static readonly FABRIC_CHAINCODE_NAME = process.env.FABRIC_CHAINCODE_NAME || 'fine-management';
    static readonly FABRIC_MSP_ID = process.env.FABRIC_MSP_ID || 'Org1MSP';
    static readonly FABRIC_PEER_ENDPOINT = process.env.FABRIC_PEER_ENDPOINT || 'localhost:7051';

    // IPFS
    static readonly IPFS_HOST = process.env.IPFS_HOST || '127.0.0.1';
    static readonly IPFS_PORT = parseInt(process.env.IPFS_PORT || '5001', 10);
    static readonly IPFS_PROTOCOL = process.env.IPFS_PROTOCOL || 'http';

    // External APIs
    static readonly SIMIT_API_URL = process.env.SIMIT_API_URL || 'https://api.simit.gov.co';
    static readonly SIMIT_API_KEY = process.env.SIMIT_API_KEY || '';

    // Security
    static readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
    static readonly JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

    /**
     * Valida que todas las variables críticas estén configuradas
     */
    static validate(): void {
        const requiredVars = ['PRIVATE_KEY', 'CONTRACT_ADDRESS'];
        const missing = requiredVars.filter(varName => !process.env[varName]);

        if (missing.length > 0 && this.NODE_ENV === 'production') {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }

    /**
     * Indica si estamos en producción
     */
    static isProduction(): boolean {
        return this.NODE_ENV === 'production';
    }

    /**
     * Indica si estamos en desarrollo
     */
    static isDevelopment(): boolean {
        return this.NODE_ENV === 'development';
    }

    /**
     * Indica si estamos en test
     */
    static isTest(): boolean {
        return this.NODE_ENV === 'test';
    }
}
