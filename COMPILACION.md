# Compilar y desplegar el Backend - Fotomultas

## Requisitos previos

| Herramienta | Versión mínima |
|------------|----------------|
| Node.js | 20.x |
| npm | 9.x |
| IPFS (Kubo) | Latest |
| Git | 2.x |

## 1. Instalar dependencias

```bash
cd backend
npm install
```

## 2. Configurar variables de entorno

Copiar el archivo de ejemplo y editar:

```bash
cp env.example .env
```

Variables **obligatorias** para desarrollo local:

```env
PORT=3000
NODE_ENV=development

# Blockchain (Hardhat local)
NODE_RPC_URL=http://127.0.0.1:8545
OPERATOR_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=<se obtiene al desplegar el contrato>

# IPFS
IPFS_API_URL=http://127.0.0.1:5001/api/v0
```

> La `OPERATOR_PRIVATE_KEY` por defecto es la cuenta #0 de Hardhat. Solo para desarrollo.

## 3. Compilar contratos inteligentes (Solidity)

```bash
npm run build:contracts
```

Esto ejecuta `hardhat compile` y genera:
- `artifacts/` - ABI y bytecode compilado
- `typechain-types/` - Tipos TypeScript generados automáticamente

Para verificar que compiló correctamente:

```bash
ls artifacts/contracts/FineManagement.sol/FineManagement.json
```

## 4. Compilar TypeScript

```bash
npm run build
```

Esto ejecuta `tsc` y genera la carpeta `dist/` con el JavaScript compilado.

### Compilar todo junto

```bash
npm run build:all
```

Equivale a: `npm run build:contracts && npm run build`

## 5. Iniciar servicios externos

### 5.1 IPFS

En una terminal separada:

```bash
ipfs daemon
```

Verificar que está corriendo:

```bash
curl -s http://127.0.0.1:5001/api/v0/id | head -c 100
```

### 5.2 Blockchain local (Hardhat)

En otra terminal separada:

```bash
npm run dev:contracts
```

Esto ejecuta `hardhat node` en `http://127.0.0.1:8545` con 20 cuentas de prueba precargadas con 10000 ETH cada una.

### 5.3 Desplegar contrato inteligente

Con el nodo Hardhat corriendo, en otra terminal:

```bash
npm run deploy
```

Esto ejecuta `scripts/deploy.mjs` y muestra la dirección del contrato:

```
FineManagement deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Actualizar** `CONTRACT_ADDRESS` en `.env` con la dirección desplegada.

> Con Hardhat local, la dirección del contrato siempre es `0x5FbDB2315678afecb367f032d93F642f64180aa3` si es el primer despliegue.

## 6. Iniciar el backend

### Desarrollo (con hot reload)

```bash
npm run dev
```

Usa `tsx watch` para recompilar automáticamente al cambiar archivos.

### Producción

```bash
npm run build:all
npm start
```

El servidor arranca en `http://localhost:3000`.

## 7. Verificar que todo funciona

### API REST

```bash
curl http://localhost:3000/api/fines
```

Respuesta esperada:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

### Documentación Swagger

Abrir en el navegador: `http://localhost:3000/api-docs`

### Crear una multa de prueba

```bash
curl -X POST http://localhost:3000/api/fines \
  -F "evidence=@/ruta/a/imagen.jpg;type=image/jpeg" \
  -F "plateNumber=ABC123" \
  -F "location=Calle 26 #68B-70, Bogotá" \
  -F "infractionType=EXCESO_VELOCIDAD" \
  -F "cost=487350" \
  -F "ownerIdentifier=12345678" \
  -F "registeredBy=Admin"
```

## 8. Ejecución completa paso a paso (resumen)

```bash
# Terminal 1: IPFS
ipfs daemon

# Terminal 2: Blockchain
cd backend
npm run dev:contracts

# Terminal 3: Desplegar contrato + Backend
cd backend
npm run deploy
npm run dev
```

## 9. Despliegue con Docker

### Iniciar todos los servicios

```bash
docker-compose up -d
```

Esto levanta: blockchain (Hardhat), IPFS (Kubo) y backend (Express).

### Desplegar contrato en Docker

```bash
docker-compose exec blockchain npx hardhat run scripts/deploy-docker.mjs --network localhost
```

### Puertos expuestos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend API | 3000 | http://localhost:3000 |
| Swagger UI | 3000 | http://localhost:3000/api-docs |
| Hardhat RPC | 8545 | http://localhost:8545 |
| IPFS API | 5001 | http://localhost:5001 |
| IPFS Gateway | 8080 | http://localhost:8080 |

### Comandos Docker utiles

```bash
docker-compose logs -f              # Ver logs de todos
docker-compose logs -f backend      # Logs solo del backend
docker-compose restart backend      # Reiniciar backend
docker-compose down                 # Detener todo
docker-compose down -v              # Detener y borrar volúmenes
```

## 10. Tests

```bash
# Tests unitarios e integración
npm test

# Tests de contratos inteligentes
npm run test:contracts

# Todos los tests
npm run test:all

# Con cobertura
npm run test:coverage
```

## 11. Limpieza

```bash
# Eliminar artifacts compilados
npm run clean

# Eliminar todo (incluye node_modules)
npm run clean:all
```

## 12. Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/fines` | Registrar nueva multa (multipart/form-data) |
| GET | `/api/fines` | Listar multas (paginado: `?page=1&pageSize=10`) |
| GET | `/api/fines/:id` | Detalle de una multa |
| PUT | `/api/fines/:id/status` | Actualizar estado |
| GET | `/api/fines/:id/integrity` | Verificar integridad blockchain |
| GET | `/api/fines/evidence/:cid` | Obtener imagen desde IPFS |
| GET | `/api/fines/:id/status-history` | Historial de estados |
| GET | `/api/fines/recent-history` | Actividad reciente |
| GET | `/api/fines/plate/:plateNumber` | Buscar por placa |

## 13. Tipos de infracción válidos

| Tipo | Costo (COP) |
|------|-------------|
| `EXCESO_VELOCIDAD` | $487.350 |
| `SEMAFORO_ROJO` | $974.700 |
| `ESTACIONAMIENTO_PROHIBIDO` | $243.675 |
| `CONDUCIR_EMBRIAGADO` | $1.949.400 |
| `NO_RESPETAR_PASO_PEATONAL` | $487.350 |
| `USO_CELULAR` | $487.350 |
| `NO_USAR_CINTURON` | $243.675 |
| `CONDUCIR_SIN_LICENCIA` | $974.700 |
| `OTRO` | $243.675 |

## 14. Estados de una multa

```
PENDING (0)  →  PAID (1), APPEALED (2), CANCELLED (4)
PAID (1)     →  APPEALED (2)
APPEALED (2) →  RESOLVED_APPEAL (3), CANCELLED (4)
RESOLVED_APPEAL (3) → PAID (1), CANCELLED (4)
CANCELLED (4) → (estado final)
```

## 15. Arquitectura del proyecto

```
backend/
├── contracts/          # Contratos Solidity
│   └── FineManagement.sol
├── scripts/            # Scripts de despliegue
│   ├── deploy.mjs
│   └── deploy-docker.mjs
├── src/
│   ├── server.ts       # Punto de entrada
│   ├── app.ts          # Configuración Express
│   ├── config/         # Configuraciones centralizadas
│   └── contexts/
│       └── fines/
│           ├── domain/          # Entidades, value objects, puertos
│           ├── application/     # Casos de uso, mappers
│           └── infrastructure/  # Adaptadores, controladores, rutas, DI
├── artifacts/          # (generado) ABIs compilados
├── dist/               # (generado) JavaScript compilado
└── typechain-types/    # (generado) Tipos TypeScript del contrato
```
