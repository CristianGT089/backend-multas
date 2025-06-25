# 🚗 Sistema de Fotomultas - Backend Unificado

Backend unificado para sistema de fotomultas con Smart Contracts, IPFS y API REST. Este proyecto integra blockchain, almacenamiento descentralizado y APIs externas para la gestión completa de multas de tránsito.

## 🏗️ Arquitectura del Proyecto

```
backend/
├── src/
│   ├── fine/                    # API REST para gestión de multas
│   │   ├── controllers/         # Controladores de la API
│   │   ├── routes/             # Definición de rutas
│   │   ├── services/           # Lógica de negocio
│   │   ├── repositories/       # Acceso a datos (Blockchain, IPFS)
│   │   └── interfaces/         # Tipos y interfaces TypeScript
│   ├── config/                 # Configuraciones (Swagger, etc.)
│   ├── app.ts                  # Configuración de Express
│   └── server.ts               # Punto de entrada del servidor
├── contracts/                  # Smart Contracts (Solidity)
├── scripts/                    # Scripts de despliegue Hardhat
├── test/                       # Tests (API + Smart Contracts)
└── hardhat.config.cjs          # Configuración Hardhat
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js**: v20.18.0 o superior
- **npm**: v10.0.0 o superior
- **IPFS**: Kubo v0.34.1 o superior
- **Git**: Para clonar el repositorio

### 1. Configuración del Entorno

```bash
# Usar la versión correcta de Node.js
nvm use 20.18.0

# Clonar el repositorio (si no lo tienes)
git clone <repository-url>
cd backend

# Instalar dependencias
npm install
```

### 2. Configuración de Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=3000

# Blockchain (Hardhat)
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# IPFS
IPFS_API_URL=http://127.0.0.1:5001

# APIs Externas (opcionales)
SIMIT_API_BASE_URL=https://api.simit.com
SIMIT_API_KEY=your_simit_api_key
```

### 3. Instalación y Configuración de IPFS

```bash
# Descargar e instalar IPFS Kubo
wget https://dist.ipfs.tech/kubo/v0.34.1/kubo_v0.34.1_linux-amd64.tar.gz
tar -xvzf kubo_v0.34.1_linux-amd64.tar.gz
cd kubo
sudo bash install.sh

# Verificar instalación
ipfs --version

# Inicializar IPFS (solo la primera vez)
ipfs init

# Iniciar daemon de IPFS
ipfs daemon
```

### 4. Despliegue de Smart Contracts

```bash
# Terminal 1: Compilar contratos
npm run build:contracts

# Terminal 2: Iniciar nodo local de Hardhat
npm run dev:contracts

# Terminal 3: Desplegar contratos
npm run deploy
```

### 5. Iniciar el Servidor

```bash
# Terminal 4: Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en: **http://localhost:3000**

## 📚 Documentación de la API

### Swagger UI
Accede a la documentación interactiva de la API:
**http://localhost:3000/api-docs**

### Endpoints Principales

#### Gestión de Multas
- `GET /api/fines` - Obtener todas las multas
- `POST /api/fines` - Registrar nueva multa
- `GET /api/fines/:fineId` - Obtener detalles de una multa
- `PUT /api/fines/:fineId/status` - Actualizar estado de multa

#### Consultas Específicas
- `GET /api/fines/by-plate/:plateNumber` - Multas por placa
- `GET /api/fines/evidence/:evidenceCID` - Obtener evidencia desde IPFS
- `GET /api/fines/:fineId/integrity` - Verificar integridad blockchain
- `GET /api/fines/:fineId/status-history` - Historial de estados

#### Integración SIMIT
- `PUT /api/fines/:fineId/link-simit` - Asociar multa con SIMIT

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Servidor de desarrollo
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar tests
npm run test
npm run test:watch
npm run test:coverage
```

### Smart Contracts
```bash
# Compilar contratos
npm run build:contracts

# Ejecutar tests de contratos
npm run test:contracts

# Nodo local Hardhat
npm run dev:contracts

# Desplegar contratos
npm run deploy
npm run deploy:sepolia
```

### Limpieza
```bash
# Limpiar archivos generados
npm run clean

# Limpiar todo (incluyendo node_modules)
npm run clean:all
```

## 🧪 Testing

### Tests de API
```bash
npm run test
```

### Tests de Smart Contracts
```bash
npm run test:contracts
```

### Tests con Reporte de Gas
```bash
REPORT_GAS=true npm run test:contracts
```

## 🔧 Tecnologías Utilizadas

### Backend
- **Express.js 4.18.2** - Framework web
- **TypeScript** - Lenguaje de programación
- **Vitest** - Framework de testing
- **Swagger** - Documentación de API

### Blockchain
- **Hardhat** - Framework de desarrollo Ethereum
- **Ethers.js** - Biblioteca para interactuar con Ethereum
- **OpenZeppelin** - Contratos seguros y estándares

### Almacenamiento
- **IPFS** - Sistema de archivos distribuido
- **Helia** - Cliente IPFS para JavaScript
- **Kubo** - Implementación de referencia de IPFS

### APIs Externas
- **SIMIT** - Sistema de Información de Multas de Tránsito
- **Axios** - Cliente HTTP

## 🚨 Solución de Problemas

### Error de path-to-regexp
Si encuentras el error `TypeError: Missing parameter name`, asegúrate de usar Express 4.18.2 (no Express 5.x).

### Puerto IPFS ocupado
```bash
# Verificar procesos IPFS
ps aux | grep ipfs

# Matar proceso si es necesario
pkill -f ipfs
```

### Puerto Hardhat ocupado
```bash
# Verificar procesos Hardhat
ps aux | grep hardhat

# Matar proceso si es necesario
pkill -f hardhat
```

## 📝 Notas de Desarrollo

- El proyecto usa **ESM (ES Modules)** con `"type": "module"` en package.json
- Los Smart Contracts están configurados para usar **Hardhat Toolbox**
- La configuración de IPFS usa **Helia** para mejor compatibilidad con ESM
- Express 4.18.2 es la versión estable recomendada (evitar Express 5.x)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.