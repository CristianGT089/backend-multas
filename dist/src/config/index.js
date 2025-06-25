import { blockchainConfig } from '../../clients/blockchain/config.js';
import { ipfsConfig } from '../../clients/ipfs/config.js';
import { externalApiConfig } from '../../clients/external/config.js';
export const config = {
    port: process.env.PORT || 3000,
    blockchain: blockchainConfig,
    ipfs: ipfsConfig,
    external: externalApiConfig,
};
// Re-exportar configuraciones específicas para compatibilidad
export { blockchainConfig, ipfsConfig, externalApiConfig };
