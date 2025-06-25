# 🧪 Tests

Esta carpeta contiene todos los tests del proyecto, organizados por tipo y tecnología.

## 🏗️ Estructura

```
test/
├── config/              # Configuración específica para tests
│   └── test.config.ts   # Configuración de timeouts, URLs, etc.
├── fine/                # Tests de la API REST
│   ├── controllers/     # Tests de controladores
│   ├── services/        # Tests de servicios
│   ├── repositories/    # Tests de repositorios
│   └── utils/           # Tests de utilidades
├── contracts/           # Tests de Smart Contracts (Mocha + Chai)
│   ├── FineManagement.test.ts
│   └── Lock.ts
├── integration/         # Tests end-to-end
│   └── (tests de integración)
├── setup.ts             # Configuración global de tests
└── README.md            # Este archivo
```

## 🚀 Ejecutar Tests

### Tests de API (Vitest)
```bash
# Todos los tests de API
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage
```

### Tests de Smart Contracts (Mocha + Chai)
```bash
# Todos los tests de contratos
npm run test:contracts

# Tests con reporte de gas
REPORT_GAS=true npm run test:contracts
```

### Tests de Integración
```bash
# Tests end-to-end
npm run test:integration
```

## 📝 Tipos de Tests

### Unit Tests (API)
- **Controllers**: Lógica de manejo de requests/responses
- **Services**: Lógica de negocio
- **Repositories**: Acceso a datos (Blockchain, IPFS)
- **Utils**: Funciones auxiliares

### Smart Contract Tests
- **Funcionalidad**: Verificar que los contratos funcionen correctamente
- **Gas**: Optimización de costos de transacción
- **Seguridad**: Verificar que no haya vulnerabilidades

### Integration Tests
- **End-to-End**: Flujos completos desde API hasta blockchain
- **Cross-Service**: Interacción entre diferentes servicios
- **External APIs**: Integración con SIMIT y otras APIs

## 🔧 Configuración

### Variables de Entorno para Tests
```env
# Tests de API
PORT=3001  # Puerto diferente para tests

# Tests de Blockchain
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Tests de IPFS
IPFS_API_URL=http://localhost:5001
```

### Configuración de Test Config
```typescript
import { testConfig } from './config/test.config.js';

// Usar en tests
const response = await request(app)
  .get('/api/fines')
  .timeout(testConfig.api.timeout);
```

## 📊 Coverage

El proyecto mantiene un coverage mínimo del 80% para:
- Líneas de código
- Funciones
- Ramas de decisión

## 🚨 Best Practices

1. **Aislamiento**: Cada test debe ser independiente
2. **Cleanup**: Limpiar datos después de cada test
3. **Mocks**: Usar mocks para servicios externos
4. **Descriptive**: Nombres descriptivos para tests
5. **Fast**: Los tests deben ejecutarse rápidamente 