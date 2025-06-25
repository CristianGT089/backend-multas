# 📁 Carpeta Clients

Esta carpeta contiene las configuraciones específicas para cada tecnología externa utilizada en el proyecto.

## 🏗️ Estructura

```
clients/
├── blockchain/          # Configuración de blockchain (Ethereum/Hardhat)
│   └── config.ts        # Configuración de RPC, contratos, claves
├── ipfs/               # Configuración de IPFS
│   └── config.ts        # Configuración de nodo IPFS
├── external/           # Configuración de APIs externas
│   └── config.ts        # Configuración de SIMIT y otras APIs
├── hardhat/            # Configuración específica de Hardhat
│   └── config.ts        # Configuración de redes, compilación, etc.
└── README.md           # Este archivo
```

## 🔧 Configuraciones

### Blockchain (`blockchain/config.ts`)
- **RPC URL**: URL del nodo Ethereum
- **Private Key**: Clave privada para transacciones
- **Contract Address**: Dirección del contrato desplegado

### IPFS (`ipfs/config.ts`)
- **API URL**: URL del nodo IPFS
- **Timeout**: Tiempo de espera para operaciones
- **Retries**: Número de reintentos

### APIs Externas (`external/config.ts`)
- **SIMIT**: Configuración para API de multas de tránsito
- **Otras APIs**: Configuraciones para futuras integraciones

### Hardhat (`hardhat/config.ts`)
- **Redes**: Configuración de localhost, hardhat, sepolia
- **Solidity**: Versión y optimizaciones del compilador
- **Paths**: Rutas de archivos y artefactos

## 📝 Uso

```typescript
// Importar configuraciones específicas
import { blockchainConfig } from '../clients/blockchain/config.js';
import { ipfsConfig } from '../clients/ipfs/config.js';
import { externalApiConfig } from '../clients/external/config.js';

// Usar en el código
const provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);
const ipfsClient = create({ url: ipfsConfig.apiUrl });
```

## 🔒 Seguridad

- Las claves privadas se cargan desde variables de entorno
- Las configuraciones sensibles no se incluyen en el código
- Cada configuración valida sus variables críticas al cargarse 