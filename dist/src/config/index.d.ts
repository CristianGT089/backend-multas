import { blockchainConfig } from '../../clients/blockchain/config.js';
import { ipfsConfig } from '../../clients/ipfs/config.js';
import { externalApiConfig } from '../../clients/external/config.js';
export declare const config: {
    port: string | number;
    blockchain: {
        rpcUrl: string;
        privateKey: string;
        contractAddress: string;
    };
    ipfs: {
        apiUrl: string;
        timeout: number;
        retries: number;
    };
    external: {
        simit: {
            baseUrl: string;
            apiKey: string | undefined;
            timeout: number;
            retries: number;
        };
    };
};
export { blockchainConfig, ipfsConfig, externalApiConfig };
