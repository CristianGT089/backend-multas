# 🏗️ Arquitectura Híbrida Blockchain - Recomendaciones de Implementación

## 📋 Resumen Ejecutivo

Este documento presenta las recomendaciones para implementar una **arquitectura híbrida blockchain** que combine **Hyperledger Fabric** (blockchain privada) con **Ethereum** (blockchain pública) para el sistema de gestión de fotomultas. La arquitectura híbrida permitirá aprovechar las ventajas de ambos ecosistemas: privacidad y control de Hyperledger para datos sensibles, y transparencia y descentralización de Ethereum para verificación pública.

## 🎯 Objetivos de la Arquitectura Híbrida

### **Hyperledger Fabric (Blockchain Privada)**
- **Propósito**: Gestión interna de datos sensibles y operaciones administrativas
- **Ventajas**: 
  - Privacidad y confidencialidad de datos
  - Control granular de permisos
  - Alto rendimiento y escalabilidad
  - Consenso eficiente (PBFT)
- **Casos de Uso**:
  - Registro interno de multas
  - Gestión de usuarios y permisos
  - Procesamiento de apelaciones
  - Auditoría interna

### **Ethereum (Blockchain Pública)**
- **Propósito**: Verificación pública y transparencia ciudadana
- **Ventajas**:
  - Transparencia total
  - Descentralización
  - Verificación pública
  - Interoperabilidad
- **Casos de Uso**:
  - Registro público de multas (solo metadatos)
  - Verificación de integridad
  - Consultas ciudadanas
  - Integración con sistemas externos

## 🏛️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA HÍBRIDA                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   FRONTEND      │    │   FRONTEND      │                    │
│  │   (React)       │    │   (React)       │                    │
│  └─────────┬───────┘    └─────────┬───────┘                    │
│            │                      │                             │
│  ┌─────────▼───────┐    ┌─────────▼───────┐                    │
│  │   BACKEND API   │    │   BACKEND API   │                    │
│  │   (Express)     │    │   (Express)     │                    │
│  └─────────┬───────┘    └─────────┬───────┘                    │
│            │                      │                             │
│  ┌─────────▼───────┐    ┌─────────▼───────┐                    │
│  │ HYPERLEDGER     │    │    ETHEREUM     │                    │
│  │ FABRIC          │    │   (Pública)     │                    │
│  │ (Privada)       │    │                 │                    │
│  │                 │    │                 │                    │
│  │ • Datos         │    │ • Metadatos     │                    │
│  │   sensibles     │    │   públicos      │                    │
│  │ • Usuarios      │    │ • Verificación  │                    │
│  │ • Apelaciones   │    │ • Integridad    │                    │
│  │ • Auditoría     │    │ • Consultas     │                    │
│  └─────────┬───────┘    └─────────┬───────┘                    │
│            │                      │                             │
│  ┌─────────▼───────┐    ┌─────────▼───────┐                    │
│  │      IPFS       │    │      IPFS       │                    │
│  │   (Privado)     │    │   (Público)     │                    │
│  │                 │    │                 │                    │
│  │ • Evidencias    │    │ • Evidencias    │                    │
│  │   internas      │    │   públicas      │                    │
│  │ • Documentos    │    │ • Metadatos     │                    │
│  │   administrativos│   │   verificables  │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Implementación Técnica

### **1. Servicios de Blockchain**

#### **Hyperledger Fabric Service**
```typescript
// src/fine/services/hyperledger.service.ts
export class HyperledgerService {
  private static instance: HyperledgerService;
  private fabricClient: FabricClient;
  private channel: Channel;
  private chaincode: Contract;

  // Métodos para operaciones privadas
  async registerInternalFine(fineData: InternalFineData): Promise<string>
  async updateFineStatus(fineId: string, status: FineStatus): Promise<void>
  async processAppeal(appealData: AppealData): Promise<string>
  async getUserPermissions(userId: string): Promise<Permission[]>
  async auditTrail(fineId: string): Promise<AuditEntry[]>
}
```

#### **Ethereum Service**
```typescript
// src/fine/services/ethereum.service.ts
export class EthereumService {
  private static instance: EthereumService;
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  // Métodos para operaciones públicas
  async registerPublicFine(metadata: PublicFineMetadata): Promise<string>
  async verifyFineIntegrity(fineId: string): Promise<IntegrityResult>
  async getPublicFineDetails(fineId: string): Promise<PublicFineData>
  async citizenQuery(plateNumber: string): Promise<PublicFineSummary[]>
}
```

### **2. Servicio de Sincronización**

```typescript
// src/fine/services/sync.service.ts
export class SyncService {
  private static instance: SyncService;
  private hyperledgerService: HyperledgerService;
  private ethereumService: EthereumService;

  // Sincronizar datos entre blockchains
  async syncFineToPublic(fineId: string): Promise<void>
  async syncStatusUpdate(fineId: string, status: FineStatus): Promise<void>
  async verifyDataConsistency(fineId: string): Promise<ConsistencyResult>
}
```

### **3. Interfaces de Datos**

```typescript
// src/fine/interfaces/hybrid-fine.interface.ts

// Datos completos (Hyperledger)
export interface InternalFineData {
  id: string;
  plateNumber: string;
  evidenceCID: string;
  location: string;
  infractionType: string;
  cost: number;
  ownerIdentifier: string;
  currentState: FineStatus;
  registeredBy: string;
  externalSystemId?: string;
  // Datos sensibles
  driverDetails: DriverDetails;
  internalNotes: string;
  appealHistory: AppealEntry[];
}

// Metadatos públicos (Ethereum)
export interface PublicFineMetadata {
  fineId: string;
  plateNumber: string;
  evidenceHash: string; // Hash de la evidencia
  location: string;
  infractionType: string;
  cost: number;
  timestamp: number;
  status: FineStatus;
  integrityHash: string; // Hash de verificación
}
```

## 📝 Modificaciones al Documento Académico

### **Secciones a Actualizar**

#### **1. Capítulo 3 - Marco Teórico**
- **Sección**: "Tecnologías Blockchain"
- **Cambios**:
  - Añadir subsección "Arquitecturas Híbridas Blockchain"
  - Explicar ventajas de combinar blockchain privada y pública
  - Incluir casos de uso gubernamentales

#### **2. Capítulo 4 - Marco Conceptual**
- **Sección**: "Arquitectura del Sistema"
- **Cambios**:
  - Redefinir la arquitectura como híbrida
  - Explicar distribución de responsabilidades
  - Incluir diagramas de flujo de datos

#### **3. Capítulo 7 - Diseño del Prototipo**
- **Sección**: "Arquitectura de Despliegue"
- **Cambios**:
  - Actualizar diagrama de despliegue
  - Incluir nodos Hyperledger Fabric
  - Mostrar integración con Ethereum

### **Nuevas Secciones Requeridas**

#### **1. "Arquitectura Híbrida Blockchain"**
```markdown
## Arquitectura Híbrida Blockchain

### Justificación de la Arquitectura Híbrida

La implementación de una arquitectura híbrida que combine Hyperledger Fabric y Ethereum permite aprovechar las ventajas de ambos ecosistemas blockchain:

- **Hyperledger Fabric**: Para operaciones internas que requieren privacidad y control
- **Ethereum**: Para verificación pública y transparencia ciudadana

### Distribución de Responsabilidades

#### Hyperledger Fabric (Blockchain Privada)
- Gestión de datos sensibles
- Control de acceso y permisos
- Procesamiento de apelaciones
- Auditoría interna

#### Ethereum (Blockchain Pública)
- Registro público de metadatos
- Verificación de integridad
- Consultas ciudadanas
- Integración con sistemas externos
```

#### **2. "Interoperabilidad Blockchain"**
```markdown
## Interoperabilidad Blockchain

### Mecanismos de Sincronización

El sistema implementa mecanismos de sincronización para mantener la consistencia entre ambas blockchains:

1. **Sincronización de Metadatos**: Los metadatos públicos se sincronizan desde Hyperledger a Ethereum
2. **Verificación de Integridad**: Ethereum valida la integridad de los datos usando hashes
3. **Actualización de Estados**: Los cambios de estado se reflejan en ambas blockchains

### Protocolos de Comunicación

- **APIs REST**: Para comunicación entre servicios
- **Eventos Blockchain**: Para notificaciones automáticas
- **Oráculos**: Para verificación externa
```

## 🔄 Plan de Migración

### **Fase 1: Preparación del Documento (2-3 semanas)**
- [ ] Actualizar Capítulo 3 - Marco Teórico
- [ ] Modificar Capítulo 4 - Marco Conceptual
- [ ] Rediseñar Capítulo 7 - Diseño del Prototipo
- [ ] Añadir nuevas secciones sobre arquitectura híbrida
- [ ] Crear diagramas actualizados

### **Fase 2: Refactoring del Código (4-6 semanas)**
- [ ] Implementar HyperledgerService
- [ ] Refactorizar EthereumService
- [ ] Crear SyncService
- [ ] Actualizar interfaces de datos
- [ ] Implementar nuevos endpoints

### **Fase 3: Testing y Validación (2-3 semanas)**
- [ ] Tests unitarios para nuevos servicios
- [ ] Tests de integración entre blockchains
- [ ] Tests de sincronización
- [ ] Validación de performance
- [ ] Auditoría de seguridad

### **Fase 4: Despliegue y Documentación (1-2 semanas)**
- [ ] Configuración de entornos
- [ ] Despliegue en red de prueba
- [ ] Documentación técnica
- [ ] Manual de usuario
- [ ] Capacitación del equipo

## 🛠️ Mejoras Específicas del Código

### **1. Eliminación del Patrón Singleton**

**Problema Actual**:
```typescript
export class BlockchainService {
    private static instance: BlockchainService;
    public static getInstance(): BlockchainService {
        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }
        return BlockchainService.instance;
    }
}
```

**Solución Propuesta**:
```typescript
// src/fine/services/service.factory.ts
export class ServiceFactory {
    private static hyperledgerService: HyperledgerService;
    private static ethereumService: EthereumService;
    private static syncService: SyncService;

    static getHyperledgerService(): HyperledgerService {
        if (!this.hyperledgerService) {
            this.hyperledgerService = new HyperledgerService();
        }
        return this.hyperledgerService;
    }

    static getEthereumService(): EthereumService {
        if (!this.ethereumService) {
            this.ethereumService = new EthereumService();
        }
        return this.ethereumService;
    }

    static getSyncService(): SyncService {
        if (!this.syncService) {
            this.syncService = new SyncService(
                this.getHyperledgerService(),
                this.getEthereumService()
            );
        }
        return this.syncService;
    }
}
```

### **2. Manejo de Errores Centralizado**

**Problema Actual**: Manejo inconsistente de errores

**Solución Propuesta**:
```typescript
// src/fine/utils/error-handler.ts
export class HybridErrorHandler {
    static handleBlockchainError(error: any, context: string): AppError {
        if (error.code === 'INSUFFICIENT_FUNDS') {
            return new AppError('Fondos insuficientes para la transacción', 400);
        }
        if (error.code === 'NETWORK_ERROR') {
            return new AppError('Error de conexión con la blockchain', 503);
        }
        if (error.message.includes('does not exist')) {
            return new AppError('Recurso no encontrado', 404);
        }
        return new AppError(`Error en ${context}: ${error.message}`, 500);
    }

    static handleSyncError(error: any): AppError {
        if (error.code === 'SYNC_TIMEOUT') {
            return new AppError('Timeout en sincronización entre blockchains', 408);
        }
        if (error.code === 'DATA_INCONSISTENCY') {
            return new AppError('Inconsistencia de datos entre blockchains', 409);
        }
        return new AppError(`Error de sincronización: ${error.message}`, 500);
    }
}
```

### **3. Validaciones Centralizadas**

**Problema Actual**: Validaciones duplicadas

**Solución Propuesta**:
```typescript
// src/fine/validations/hybrid-validations.ts
export const hybridFineValidations = {
    registerFine: Joi.object({
        plateNumber: Joi.string().pattern(/^[A-Z]{3}[0-9]{3}$/).required(),
        location: Joi.string().min(5).max(200).required(),
        infractionType: Joi.string().valid('SPEEDING', 'RED_LIGHT', 'PARKING').required(),
        cost: Joi.number().min(0).max(1000000).required(),
        ownerIdentifier: Joi.string().min(8).max(20).required(),
        evidenceFile: Joi.object().required()
    }),

    updateStatus: Joi.object({
        newState: Joi.number().valid(0, 1, 2, 3, 4).required(),
        reason: Joi.string().min(10).max(500).required()
    }),

    syncData: Joi.object({
        fineId: Joi.string().uuid().required(),
        targetBlockchain: Joi.string().valid('ethereum', 'hyperledger').required(),
        metadata: Joi.object().required()
    })
};
```

### **4. Configuración Dinámica**

**Problema Actual**: Configuración hardcoded

**Solución Propuesta**:
```typescript
// src/config/hybrid.config.ts
export const hybridConfig = {
    hyperledger: {
        networkName: process.env.HYPERLEDGER_NETWORK || 'fotomultas-network',
        channelName: process.env.HYPERLEDGER_CHANNEL || 'fines-channel',
        chaincodeName: process.env.HYPERLEDGER_CHAINCODE || 'fine-management',
        peerEndpoints: process.env.HYPERLEDGER_PEERS?.split(',') || [],
        caEndpoint: process.env.HYPERLEDGER_CA || 'http://localhost:7054',
        adminUser: process.env.HYPERLEDGER_ADMIN_USER || 'admin',
        adminPassword: process.env.HYPERLEDGER_ADMIN_PASSWORD || 'adminpw'
    },
    ethereum: {
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'http://localhost:8545',
        privateKey: process.env.ETHEREUM_PRIVATE_KEY || '',
        contractAddress: process.env.ETHEREUM_CONTRACT_ADDRESS || '',
        gasLimit: parseInt(process.env.ETHEREUM_GAS_LIMIT || '300000'),
        gasPrice: process.env.ETHEREUM_GAS_PRICE || '20000000000'
    },
    sync: {
        enabled: process.env.SYNC_ENABLED === 'true',
        interval: parseInt(process.env.SYNC_INTERVAL || '30000'),
        timeout: parseInt(process.env.SYNC_TIMEOUT || '10000'),
        retryAttempts: parseInt(process.env.SYNC_RETRY_ATTEMPTS || '3')
    }
};
```

## 🧪 Testing Comprehensivo

### **1. Tests Unitarios**

```typescript
// test/services/hyperledger.service.test.ts
describe('HyperledgerService', () => {
    let hyperledgerService: HyperledgerService;
    let mockFabricClient: jest.Mocked<FabricClient>;

    beforeEach(() => {
        mockFabricClient = createMockFabricClient();
        hyperledgerService = new HyperledgerService(mockFabricClient);
    });

    describe('registerInternalFine', () => {
        it('should register fine successfully', async () => {
            const fineData = createMockFineData();
            mockFabricClient.submitTransaction.mockResolvedValue('tx123');

            const result = await hyperledgerService.registerInternalFine(fineData);

            expect(result).toBe('tx123');
            expect(mockFabricClient.submitTransaction).toHaveBeenCalledWith(
                'registerFine',
                expect.any(String)
            );
        });

        it('should handle network errors', async () => {
            const fineData = createMockFineData();
            mockFabricClient.submitTransaction.mockRejectedValue(
                new Error('Network error')
            );

            await expect(
                hyperledgerService.registerInternalFine(fineData)
            ).rejects.toThrow('Network error');
        });
    });
});
```

### **2. Tests de Integración**

```typescript
// test/integration/hybrid-blockchain.test.ts
describe('Hybrid Blockchain Integration', () => {
    let hyperledgerService: HyperledgerService;
    let ethereumService: EthereumService;
    let syncService: SyncService;

    beforeEach(async () => {
        hyperledgerService = ServiceFactory.getHyperledgerService();
        ethereumService = ServiceFactory.getEthereumService();
        syncService = ServiceFactory.getSyncService();
    });

    describe('Fine Registration Flow', () => {
        it('should register fine in both blockchains', async () => {
            const fineData = createMockFineData();

            // Register in Hyperledger
            const hyperledgerTxId = await hyperledgerService.registerInternalFine(fineData);
            expect(hyperledgerTxId).toBeDefined();

            // Sync to Ethereum
            await syncService.syncFineToPublic(hyperledgerTxId);

            // Verify in Ethereum
            const publicFine = await ethereumService.getPublicFineDetails(hyperledgerTxId);
            expect(publicFine.plateNumber).toBe(fineData.plateNumber);
            expect(publicFine.integrityHash).toBeDefined();
        });
    });
});
```

## 📊 Monitoreo y Logging

### **1. Logging Estructurado**

```typescript
// src/fine/utils/logger.ts
export class HybridLogger {
    private static instance: HybridLogger;
    private logger: winston.Logger;

    private constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log' }),
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });
    }

    static getInstance(): HybridLogger {
        if (!HybridLogger.instance) {
            HybridLogger.instance = new HybridLogger();
        }
        return HybridLogger.instance;
    }

    logFineRegistration(fineId: string, blockchain: 'hyperledger' | 'ethereum', txId: string) {
        this.logger.info('Fine registered', {
            fineId,
            blockchain,
            transactionId: txId,
            timestamp: new Date().toISOString()
        });
    }

    logSyncOperation(fineId: string, fromBlockchain: string, toBlockchain: string, status: 'success' | 'error') {
        this.logger.info('Sync operation', {
            fineId,
            fromBlockchain,
            toBlockchain,
            status,
            timestamp: new Date().toISOString()
        });
    }
}
```

### **2. Métricas de Performance**

```typescript
// src/fine/utils/metrics.ts
export class HybridMetrics {
    private static instance: HybridMetrics;
    private metrics: Map<string, number> = new Map();

    static getInstance(): HybridMetrics {
        if (!HybridMetrics.instance) {
            HybridMetrics.instance = new HybridMetrics();
        }
        return HybridMetrics.instance;
    }

    recordTransactionTime(blockchain: string, operation: string, duration: number) {
        const key = `${blockchain}.${operation}.duration`;
        this.metrics.set(key, duration);
    }

    recordSyncTime(fineId: string, duration: number) {
        const key = `sync.${fineId}.duration`;
        this.metrics.set(key, duration);
    }

    getMetrics(): Record<string, number> {
        return Object.fromEntries(this.metrics);
    }
}
```

## 🔒 Seguridad y Auditoría

### **1. Auditoría de Transacciones**

```typescript
// src/fine/services/audit.service.ts
export class AuditService {
    private static instance: AuditService;

    async auditFineOperation(operation: string, fineId: string, userId: string, details: any) {
        const auditEntry = {
            id: uuidv4(),
            operation,
            fineId,
            userId,
            timestamp: new Date().toISOString(),
            details,
            blockchain: 'hybrid'
        };

        // Store in Hyperledger for internal audit
        await this.storeInternalAudit(auditEntry);

        // Store hash in Ethereum for public verification
        const auditHash = crypto.createHash('sha256').update(JSON.stringify(auditEntry)).digest('hex');
        await this.storePublicAuditHash(fineId, auditHash);
    }

    async verifyAuditIntegrity(fineId: string): Promise<boolean> {
        const internalAudit = await this.getInternalAudit(fineId);
        const publicHash = await this.getPublicAuditHash(fineId);
        
        const calculatedHash = crypto.createHash('sha256').update(JSON.stringify(internalAudit)).digest('hex');
        return calculatedHash === publicHash;
    }
}
```

### **2. Control de Acceso**

```typescript
// src/fine/middleware/access-control.ts
export class AccessControlMiddleware {
    static async checkHyperledgerAccess(req: Request, res: Response, next: NextFunction) {
        const userRole = req.user?.role;
        const operation = req.route?.path;

        if (operation.includes('/internal/') && !['admin', 'agent'].includes(userRole)) {
            return res.status(403).json({ message: 'Acceso denegado a operaciones internas' });
        }

        next();
    }

    static async checkEthereumAccess(req: Request, res: Response, next: NextFunction) {
        const userRole = req.user?.role;
        const operation = req.route?.path;

        if (operation.includes('/public/') && !['admin', 'agent', 'citizen'].includes(userRole)) {
            return res.status(403).json({ message: 'Acceso denegado a operaciones públicas' });
        }

        next();
    }
}
```

## 📈 Escalabilidad y Performance

### **1. Caché Distribuido**

```typescript
// src/fine/services/cache.service.ts
export class CacheService {
    private static instance: CacheService;
    private redis: Redis;

    async cacheFineData(fineId: string, data: any, ttl: number = 3600) {
        await this.redis.setex(`fine:${fineId}`, ttl, JSON.stringify(data));
    }

    async getCachedFineData(fineId: string): Promise<any | null> {
        const cached = await this.redis.get(`fine:${fineId}`);
        return cached ? JSON.parse(cached) : null;
    }

    async invalidateFineCache(fineId: string) {
        await this.redis.del(`fine:${fineId}`);
    }
}
```

### **2. Procesamiento Asíncrono**

```typescript
// src/fine/services/queue.service.ts
export class QueueService {
    private static instance: QueueService;
    private queue: Queue;

    async enqueueSyncOperation(fineId: string, priority: 'high' | 'normal' | 'low' = 'normal') {
        await this.queue.add('sync-operation', {
            fineId,
            priority,
            timestamp: new Date().toISOString()
        }, {
            priority: priority === 'high' ? 1 : priority === 'normal' ? 5 : 10
        });
    }

    async processSyncOperation(job: Job) {
        const { fineId } = job.data;
        const syncService = ServiceFactory.getSyncService();
        
        try {
            await syncService.syncFineToPublic(fineId);
            HybridLogger.getInstance().logSyncOperation(fineId, 'hyperledger', 'ethereum', 'success');
        } catch (error) {
            HybridLogger.getInstance().logSyncOperation(fineId, 'hyperledger', 'ethereum', 'error');
            throw error;
        }
    }
}
```

## 🚀 Próximos Pasos

### **Inmediatos (Esta Semana)**
1. **Actualizar Documento Académico**
   - Modificar Capítulo 3 (Marco Teórico)
   - Actualizar Capítulo 4 (Marco Conceptual)
   - Rediseñar Capítulo 7 (Diseño del Prototipo)

2. **Crear Diagramas Actualizados**
   - Arquitectura híbrida
   - Flujo de datos
   - Diagrama de despliegue

### **Corto Plazo (2-3 Semanas)**
1. **Implementar Servicios Base**
   - HyperledgerService
   - EthereumService
   - SyncService

2. **Refactorizar Código Existente**
   - Eliminar Singleton
   - Centralizar manejo de errores
   - Implementar validaciones centralizadas

### **Mediano Plazo (1-2 Meses)**
1. **Testing Comprehensivo**
   - Tests unitarios
   - Tests de integración
   - Tests de performance

2. **Despliegue y Validación**
   - Configuración de entornos
   - Pruebas en red de prueba
   - Optimización de performance

### **Largo Plazo (2-3 Meses)**
1. **Producción**
   - Despliegue en producción
   - Monitoreo continuo
   - Mantenimiento y actualizaciones

## 📚 Recursos Adicionales

### **Documentación Técnica**
- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Ethereum Developer Resources](https://ethereum.org/developers/)
- [IPFS Documentation](https://docs.ipfs.io/)

### **Herramientas Recomendadas**
- **Hyperledger**: Fabric SDK for Node.js
- **Ethereum**: Ethers.js v6
- **Testing**: Jest + Supertest
- **Monitoring**: Winston + Prometheus
- **Caching**: Redis
- **Queue**: Bull Queue

### **Mejores Prácticas**
- [Blockchain Security Best Practices](https://owasp.org/www-project-blockchain-security/)
- [Hybrid Blockchain Architecture Patterns](https://www.ibm.com/cloud/architecture/architectures/blockchain/)
- [Government Blockchain Implementation Guide](https://www.gartner.com/en/documents/3971235)

---

**Documento creado por**: Planner AI Assistant  
**Fecha**: Enero 2025  
**Versión**: 1.0  
**Estado**: Borrador para revisión
