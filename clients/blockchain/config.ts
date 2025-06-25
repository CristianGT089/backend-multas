import dotenv from 'dotenv';
dotenv.config();

export const blockchainConfig = {
  rpcUrl: process.env.NODE_RPC_URL!,
  privateKey: process.env.OPERATOR_PRIVATE_KEY!,
  contractAddress: process.env.CONTRACT_ADDRESS!,
  // contractAbi:PhotomultaABI.abi, // Load this properly
};

if (!blockchainConfig.rpcUrl || !blockchainConfig.privateKey || !blockchainConfig.contractAddress) {
  throw new Error("Missing critical blockchain environment variables!");
} 