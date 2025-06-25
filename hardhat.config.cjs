require("@nomicfoundation/hardhat-toolbox");
require("@typechain/hardhat");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
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
    tests: "./test/contracts",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6"
  }
}; 