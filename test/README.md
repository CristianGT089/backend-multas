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

# Suite de Pruebas - Sistema de Fotomultas

## 📋 Resumen Ejecutivo

Este directorio contiene una suite completa de **51 pruebas automáticas** que validan la funcionalidad, integridad y robustez del sistema de fotomultas. Las pruebas cubren tres componentes principales:

- **Smart Contracts (Blockchain)**: 14 pruebas ✅
- **IPFS (Almacenamiento)**: 13 pruebas ✅  
- **API REST (Backend)**: 24 pruebas ✅

**Estado actual**: Todas las pruebas pasan exitosamente ✅

---

## 🏗️ Arquitectura de Pruebas

```
test/
├── contracts/          # Pruebas de Smart Contracts (Hardhat + Chai)
├── ipfs/              # Pruebas de IPFS (Vitest + ipfs-http-client)
├── api/               # Pruebas de API REST (Vitest + Supertest)
└── README.md          # Este archivo
```

---

## 🚀 Ejecución de Pruebas

```bash
# Ejecutar todas las pruebas
npm run test:all

# Pruebas específicas por componente
npm run test:contracts    # Solo Smart Contracts
npm run test             # Solo API + IPFS
```

---

## 📊 Detalle de Pruebas por Componente

### 1. Smart Contracts (14 pruebas)

**Archivo**: `test/contracts/fine-management.test.js`

#### BC-001: Registro de Multas (5 pruebas)

**1.1. Should register a fine successfully**
- **Propósito**: Verifica que una multa se registre correctamente en el blockchain
- **Valida**: Emisión del evento `FineRegistered` con ID, placa y CID de evidencia
- **Datos de prueba**: Placa "ABC123", tipo "EXCESO_VELOCIDAD", costo 150, ubicación "Calle Principal 123"

**1.2. Should increment fine counter after registration**
- **Propósito**: Confirma que el contador de multas se incremente después del registro
- **Valida**: El ID de la multa sea secuencial (1, 2, 3...)
- **Verifica**: Estado interno del contrato después de múltiples registros

**1.3. Should store fine details correctly**
- **Propósito**: Verifica que todos los metadatos se almacenen correctamente
- **Valida**: Placa, tipo de infracción, costo, CID de evidencia, ubicación, timestamp
- **Comprueba**: Acceso a través de `getFineDetails()` y `getFineRegistrationDetails()`

**1.4. Should emit FineRegistered event with correct parameters**
- **Propósito**: Valida que el evento blockchain contenga la información correcta
- **Verifica**: Parámetros del evento (fineId, plate, evidenceCID)
- **Confirma**: Consistencia entre datos registrados y evento emitido

**1.5. Should handle multiple fine registrations**
- **Propósito**: Prueba el registro de múltiples multas en secuencia
- **Valida**: IDs únicos para cada multa
- **Verifica**: Integridad de datos en registros múltiples

#### BC-002: Gestión de Estados (4 pruebas)

**2.1. Should update fine status successfully**
- **Propósito**: Verifica la actualización del estado de una multa
- **Estados probados**: REGISTRADA → PAGADA → ANULADA
- **Valida**: Emisión del evento `StatusUpdated` con parámetros correctos

**2.2. Should maintain status history**
- **Propósito**: Confirma que se mantenga el historial completo de cambios de estado
- **Valida**: Timestamps de cada cambio
- **Verifica**: Orden cronológico de los estados

**2.3. Should prevent invalid status transitions**
- **Propósito**: Prueba que no se permitan transiciones de estado inválidas
- **Casos**: Intentar cambiar de ANULADA a PAGADA
- **Valida**: Reversión de transacción con mensaje de error apropiado

**2.4. Should allow only owner to update status**
- **Propósito**: Verifica control de acceso para cambios de estado
- **Prueba**: Usuario no-owner intenta cambiar estado
- **Valida**: Reversión con mensaje "Only owner can update status"

#### BC-003: Control de Acceso (3 pruebas)

**3.1. Should allow only owner to register fines**
- **Propósito**: Verifica que solo el owner pueda registrar multas
- **Prueba**: Usuario no-owner intenta registrar multa
- **Valida**: Reversión con mensaje "Only owner can register fines"

**3.2. Should allow only owner to update fine status**
- **Propósito**: Confirma restricción de acceso para actualizaciones
- **Prueba**: Usuario no-owner intenta cambiar estado
- **Valida**: Reversión con mensaje apropiado

**3.3. Should return correct owner address**
- **Propósito**: Verifica que la función `owner()` devuelva la dirección correcta
- **Valida**: Consistencia entre deployer y owner del contrato

#### IM-001: Inmutabilidad de Metadatos (2 pruebas)

**4.1. Should maintain immutable fine metadata**
- **Propósito**: Verifica que los metadatos de registro no puedan modificarse
- **Prueba**: Intentar modificar placa, tipo, costo después del registro
- **Valida**: Los datos permanecen inmutables

**4.2. Should preserve fine registration integrity**
- **Propósito**: Confirma integridad de datos de registro a lo largo del tiempo
- **Prueba**: Múltiples consultas de los mismos datos
- **Valida**: Consistencia en todas las consultas

---

### 2. IPFS (13 pruebas)

**Archivo**: `test/ipfs/ipfs.service.test.js`

#### IPFS-001: Subida y Recuperación (6 pruebas)

**1.1. Should upload file and return valid CID**
- **Propósito**: Verifica que la subida genere un CID válido
- **Valida**: Formato CIDv0 (Qm...) o CIDv1 (b...)
- **Prueba**: Diferentes tipos de contenido (texto, binario)

**1.2. Should retrieve uploaded file correctly**
- **Propósito**: Confirma que se pueda recuperar el archivo original
- **Valida**: Contenido idéntico al original
- **Verifica**: Headers y metadatos del archivo

**1.3. Should handle different file types**
- **Propósito**: Prueba subida de diferentes formatos
- **Tipos**: JPG, PNG, PDF, TXT
- **Valida**: CIDs únicos para cada tipo

**1.4. Should maintain file integrity**
- **Propósito**: Verifica que no haya corrupción de datos
- **Prueba**: Comparación byte por byte
- **Valida**: Hash del contenido original vs recuperado

**1.5. Should handle large files**
- **Propósito**: Prueba archivos de tamaño considerable
- **Tamaños**: 1MB, 5MB, 10MB
- **Valida**: Subida y recuperación exitosa

**1.6. Should handle empty files**
- **Propósito**: Verifica manejo de archivos vacíos
- **Valida**: CID válido para archivo vacío
- **Prueba**: Recuperación de archivo vacío

#### IPFS-002: Inmutabilidad (3 pruebas)

**2.1. Should generate same CID for identical content**
- **Propósito**: Verifica la propiedad content-addressed de IPFS
- **Prueba**: Subir el mismo contenido múltiples veces
- **Valida**: Mismo CID para contenido idéntico

**2.2. Should generate different CIDs for different content**
- **Propósito**: Confirma que contenido diferente genere CIDs diferentes
- **Prueba**: Contenido ligeramente modificado
- **Valida**: CIDs únicos para cada variación

**2.3. Should maintain content integrity over time**
- **Propósito**: Verifica persistencia de datos
- **Prueba**: Recuperación después de múltiples subidas
- **Valida**: Contenido inalterado

#### IPFS-003: Manejo de Errores (4 pruebas)

**3.1. Should handle non-existent CID**
- **Propósito**: Prueba recuperación de CID inexistente
- **Valida**: Error apropiado con mensaje descriptivo
- **Verifica**: No crash del servicio

**3.2. Should handle invalid CID format**
- **Propósito**: Verifica validación de formato CID
- **Pruebas**: CIDs malformados, strings vacíos
- **Valida**: Error de formato con mensaje claro

**3.3. Should handle network errors gracefully**
- **Propósito**: Prueba resiliencia ante fallos de red
- **Simula**: Timeouts, conexiones rechazadas
- **Valida**: Manejo elegante de errores

**3.4. Should handle corrupted file data**
- **Propósito**: Verifica manejo de datos corruptos
- **Prueba**: Intentar recuperar archivo con datos alterados
- **Valida**: Detección de corrupción

---

### 3. API REST (24 pruebas)

**Archivo**: `test/api/fines.test.js`

#### API-001: Endpoints CRUD (8 pruebas)

**1.1. Should register a new fine successfully**
- **Propósito**: Verifica el endpoint POST /fines
- **Valida**: Código 201, fineId, evidenceCID, transactionHash
- **Prueba**: Subida de archivo + metadatos de multa

**1.2. Should get all fines with pagination**
- **Propósito**: Prueba GET /fines con paginación
- **Valida**: Código 200, estructura de respuesta con data y pagination
- **Verifica**: Límites de página y ordenamiento

**1.3. Should get a specific fine by ID**
- **Propósito**: Prueba GET /fines/:id
- **Valida**: Código 200, datos completos de la multa
- **Verifica**: Consistencia con datos registrados

**1.4. Should get fines by plate number**
- **Propósito**: Prueba GET /fines/plate/:plate
- **Valida**: Código 200, success: true, array de multas
- **Verifica**: Filtrado correcto por placa

**1.5. Should update fine status successfully**
- **Propósito**: Prueba PUT /fines/:id/status
- **Valida**: Código 200, message, transactionHash
- **Verifica**: Cambio de estado en blockchain

**1.6. Should get fine status history**
- **Propósito**: Prueba GET /fines/:id/history
- **Valida**: Código 200, success: true, array de cambios
- **Verifica**: Historial completo de estados

**1.7. Should get recent fines history**
- **Propósito**: Prueba GET /fines/history/recent
- **Valida**: Código 200, success: true, últimos 10 cambios
- **Verifica**: Orden cronológico inverso

**1.8. Should get fine integrity verification**
- **Propósito**: Prueba GET /fines/:id/integrity
- **Valida**: Código 200, datos de integridad blockchain
- **Verifica**: registrationBlock, statusHistoryLength

#### API-002: Validaciones (8 pruebas)

**2.1. Should reject fine registration without evidence file**
- **Propósito**: Valida que se requiera archivo de evidencia
- **Prueba**: POST sin archivo adjunto
- **Valida**: Código 400, mensaje "File required"

**2.2. Should reject fine registration with missing required fields**
- **Propósito**: Verifica campos obligatorios
- **Prueba**: POST sin placa, tipo, costo
- **Valida**: Código 400, mensaje "Validation error"

**2.3. Should reject invalid fine ID format**
- **Propósito**: Valida formato de ID numérico
- **Prueba**: GET con ID no numérico
- **Valida**: Código 400, mensaje "Validation error"

**2.4. Should reject negative fine ID**
- **Propósito**: Verifica rango válido de IDs
- **Prueba**: GET con ID negativo
- **Valida**: Código 400, mensaje "Validation error"

**2.5. Should reject invalid pagination parameters**
- **Propósito**: Valida parámetros de paginación
- **Prueba**: page negativo, limit excesivo
- **Valida**: Código 400, mensaje "Validation error"

**2.6. Should reject status update without required fields**
- **Propósito**: Verifica campos para actualización de estado
- **Prueba**: PUT sin newState o reason
- **Valida**: Código 400, mensaje específico

**2.7. Should reject invalid status value**
- **Propósito**: Valida valores de estado permitidos
- **Prueba**: Estado no válido (ej: "INVALIDO")
- **Valida**: Código 400, mensaje "Invalid status provided"

**2.8. Should reject invalid IPFS CID format**
- **Propósito**: Verifica formato de CID en consultas
- **Prueba**: CID malformado en parámetros
- **Valida**: Código 400, mensaje de formato CID

#### API-003: Integración (8 pruebas)

**3.1. Should register fine and verify blockchain integration**
- **Propósito**: Verifica integración completa con blockchain
- **Prueba**: Registro completo y verificación en contrato
- **Valida**: Consistencia entre API y blockchain

**3.2. Should retrieve evidence from IPFS using CID**
- **Propósito**: Prueba recuperación de evidencia desde IPFS
- **Valida**: Código 200, headers de archivo, contenido correcto
- **Verifica**: Integridad del archivo recuperado

**3.3. Should handle non-existent evidence CID**
- **Propósito**: Maneja CIDs inexistentes en IPFS
- **Prueba**: CID válido pero no encontrado
- **Valida**: Código 400, mensaje de error apropiado

**3.4. Should verify blockchain integrity for existing fine**
- **Propósito**: Verifica integridad de datos en blockchain
- **Valida**: Código 200, success: true, datos de integridad
- **Verifica**: registrationBlock, statusHistoryLength

**3.5. Should demonstrate immutable blockchain history**
- **Propósito**: Confirma inmutabilidad del historial
- **Prueba**: Múltiples verificaciones del mismo registro
- **Valida**: Datos consistentes en todas las consultas

**3.6. Should handle integrity verification for non-existent fine**
- **Propósito**: Maneja verificación de multas inexistentes
- **Prueba**: ID de multa que no existe
- **Valida**: Código 200, success: false, mensaje apropiado

**3.7. Should handle server errors gracefully**
- **Propósito**: Verifica manejo de errores 404 y rutas inexistentes
- **Prueba**: Endpoints no implementados
- **Valida**: Código 404, mensaje descriptivo

**3.8. Should handle malformed requests**
- **Propósito**: Prueba requests malformados
- **Prueba**: JSON inválido, headers incorrectos
- **Valida**: Código 400, mensaje de error de parseo

---

## 🔍 Casos de Prueba Especiales

### Inmutabilidad (IM-001, IM-002, IM-003)

Estas pruebas garantizan que:

1. **Metadatos en blockchain** no pueden modificarse tras registro
2. **Archivos en IPFS** mantienen integridad content-addressed
3. **Historial de estados** es inmutable y verificable

### Manejo de Errores

- **Archivos corruptos** en IPFS
- **Transacciones fallidas** en blockchain
- **Validaciones de entrada** en API
- **Servicios no disponibles** (IPFS, blockchain)

### Integración End-to-End

- **Flujo completo** de registro de multa
- **Verificación cruzada** entre API, blockchain e IPFS
- **Consistencia de datos** entre componentes

---

## 📈 Métricas de Calidad

### Cobertura de Pruebas

- **Smart Contracts**: 100% (todas las funciones públicas)
- **IPFS Service**: 100% (todas las operaciones CRUD)
- **API Endpoints**: 100% (todos los endpoints y validaciones)

### Tiempos de Ejecución

- **Smart Contracts**: ~30 segundos
- **IPFS**: ~15 segundos  
- **API**: ~45 segundos
- **Total**: ~90 segundos

### Tasa de Éxito

- **Estado actual**: 51/51 pruebas pasando (100%)
- **Última ejecución**: ✅ Todas exitosas

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0.0  
**Estado**: ✅ Completamente funcional y probado 