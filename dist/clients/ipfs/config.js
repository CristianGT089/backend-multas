import dotenv from 'dotenv';
dotenv.config();
export const ipfsConfig = {
    apiUrl: process.env.IPFS_API_URL,
    // Configuraciones adicionales de IPFS si son necesarias
    timeout: 30000, // 30 segundos
    retries: 3,
};
if (!ipfsConfig.apiUrl) {
    throw new Error("Missing critical IPFS environment variables!");
}
