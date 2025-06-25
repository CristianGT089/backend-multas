require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Importar configuración desde clients/hardhat/config.cjs
const { hardhatConfig } = require("./clients/hardhat/config.cjs");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = hardhatConfig; 