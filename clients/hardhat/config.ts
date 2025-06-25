require('dotenv').config();

const hardhatConfig = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
    },
    sepolia: {
      url: process.env.RPC_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC || "",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    }
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};

// Validar variables críticas solo para Sepolia
if (process.env.NETWORK === 'sepolia' && (!process.env.MNEMONIC || !process.env.RPC_URL)) {
  throw new Error("Missing critical environment variables: MNEMONIC or RPC_URL");
}

module.exports = { hardhatConfig }; 