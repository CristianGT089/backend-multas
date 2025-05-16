import dotenv from 'dotenv';
dotenv.config();

// It's good practice to load ABI from a JSON file
// For now, we'll assume it's available.
// import PhotomultaABI from '.../atifacts/contracts/Photomulta.sol/Photomulta.json'; 

export const config = {
  port: process.env.PORT || 3000,
  rpcUrl: process.env.RPC_URL!,
  privateKey: process.env.PRIVATE_KEY!,
  contractAddress: process.env.CONTRACT_ADDRESS!,
  // contractAbi:PhotomultaABI.abi, // Load this properly
  ipfsApiUrl: process.env.IPFS_API_URL!,
  simitApiBaseUrl: process.env.SIMIT_API_BASE_URL!,
  simitApiKey: process.env.SIMIT_API_KEY,
};

if (!config.rpcUrl || !config.privateKey || !config.contractAddress || !config.ipfsApiUrl) {
  throw new Error("Missing critical environment variables!");
}