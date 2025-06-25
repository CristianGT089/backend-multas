import dotenv from 'dotenv';
dotenv.config();

export const testConfig = {
  // Configuración para tests de API
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
  },
  
  // Configuración para tests de Smart Contracts
  blockchain: {
    rpcUrl: 'http://127.0.0.1:8545',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    contractAddress: process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },
  
  // Configuración para tests de IPFS
  ipfs: {
    apiUrl: 'http://localhost:5001',
    timeout: 30000,
  },
  
  // Configuración para tests de integración
  integration: {
    timeout: 60000, // 1 minuto para tests de integración
    retries: 3,
  },
}; 