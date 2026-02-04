# 🐳 Guía de Despliegue con Docker

Esta guía te ayudará a desplegar todo el sistema de fotomultas usando Docker, incluyendo el blockchain, IPFS y el backend.

## 📋 Prerrequisitos

- Docker (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)
- 4GB de RAM disponible

## 🚀 Despliegue Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.docker .env

# Editar el archivo .env y configurar tus API keys
nano .env
```

### 2. Iniciar los Servicios

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver los logs
docker-compose logs -f
```

### 3. Desplegar el Contrato Inteligente

Una vez que el nodo blockchain esté corriendo:

```bash
# Desplegar el contrato
docker-compose exec blockchain npm run deploy

# O usando el script específico para Docker
docker-compose exec blockchain npx hardhat run scripts/deploy-docker.mjs --network localhost
```

El script guardará la dirección del contrato en `deployments/docker-deployment.json`.

### 4. Actualizar la Dirección del Contrato

```bash
# Editar el archivo .env y agregar la dirección del contrato
nano .env

# Agregar:
# ETHEREUM_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Reiniciar el backend
docker-compose restart backend
```

## 📦 Servicios Disponibles

| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| Backend | 3000 | http://localhost:3000 | API REST |
| Swagger | 3000 | http://localhost:3000/api-docs | Documentación API |
| Blockchain | 8545 | http://localhost:8545 | Nodo Hardhat |
| IPFS API | 5001 | http://localhost:5001 | API de IPFS |
| IPFS Gateway | 8080 | http://localhost:8080 | Gateway de IPFS |

## 🔧 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f blockchain
docker-compose logs -f ipfs

# Reiniciar un servicio
docker-compose restart backend

# Ver estado de los servicios
docker-compose ps
```

### Acceder a los Contenedores

```bash
# Acceder al contenedor del backend
docker-compose exec backend sh

# Acceder al contenedor del blockchain
docker-compose exec blockchain sh

# Acceder al contenedor de IPFS
docker-compose exec ipfs sh
```

### Blockchain

```bash
# Desplegar el contrato
docker-compose exec blockchain npm run deploy

# Ejecutar tests de contratos
docker-compose exec blockchain npm run test:contracts

# Ver las cuentas disponibles (en los logs del blockchain)
docker-compose logs blockchain | grep "Account"
```

### Backend

```bash
# Ver logs del backend
docker-compose logs -f backend

# Reiniciar el backend
docker-compose restart backend

# Ejecutar comando dentro del backend
docker-compose exec backend node dist/server.js
```

### IPFS

```bash
# Ver versión de IPFS
docker-compose exec ipfs ipfs version

# Ver información del nodo
docker-compose exec ipfs ipfs id

# Listar archivos en IPFS
docker-compose exec ipfs ipfs pin ls
```

## 🔍 Verificación del Despliegue

### 1. Verificar que todos los servicios están corriendo

```bash
docker-compose ps
```

Todos los servicios deben mostrar estado `Up` y `healthy`.

### 2. Verificar el Backend

```bash
curl http://localhost:3000/health
```

Debe responder con un objeto JSON indicando el estado del servicio.

### 3. Verificar el Blockchain

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

### 4. Verificar IPFS

```bash
curl http://localhost:5001/api/v0/version
```

## 🐛 Solución de Problemas

### El blockchain no inicia

```bash
# Ver logs detallados
docker-compose logs blockchain

# Reiniciar el servicio
docker-compose restart blockchain

# Eliminar y recrear el servicio
docker-compose rm -f blockchain
docker-compose up -d blockchain
```

### Error al conectar con IPFS

```bash
# Verificar que IPFS está corriendo
docker-compose ps ipfs

# Reiniciar IPFS
docker-compose restart ipfs

# Ver logs de IPFS
docker-compose logs ipfs
```

### El backend no puede conectarse a los servicios

```bash
# Verificar las variables de entorno
docker-compose exec backend env | grep -E "(IPFS|ETHEREUM)"

# Verificar la red
docker network inspect backend_fotomultas-network

# Reiniciar todos los servicios
docker-compose restart
```

### Error "Contract not deployed"

Esto significa que necesitas desplegar el contrato o actualizar la dirección en el `.env`:

```bash
# Desplegar el contrato
docker-compose exec blockchain npm run deploy

# Actualizar .env con la dirección del contrato
# Reiniciar el backend
docker-compose restart backend
```

## 🔄 Actualización del Sistema

```bash
# Detener los servicios
docker-compose down

# Hacer pull de los cambios
git pull

# Reconstruir las imágenes
docker-compose build --no-cache

# Iniciar los servicios
docker-compose up -d
```

## 🧹 Limpieza Completa

```bash
# Detener y eliminar todo (contenedores, volúmenes, redes)
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all -v

# Limpiar el sistema Docker
docker system prune -a --volumes
```

## 📊 Monitoreo

### Ver uso de recursos

```bash
# Ver estadísticas en tiempo real
docker stats

# Ver solo los servicios de fotomultas
docker stats fotomultas-backend fotomultas-blockchain fotomultas-ipfs
```

### Healthchecks

```bash
# Ver el estado de salud de los servicios
docker-compose ps
```

## 🔐 Seguridad en Producción

Para desplegar en producción, asegúrate de:

1. **Cambiar todas las claves secretas** en el archivo `.env`
2. **Usar una private key segura** para el blockchain
3. **Configurar CORS** correctamente para tu frontend
4. **Usar HTTPS** con un reverse proxy (nginx/traefik)
5. **Limitar los puertos expuestos** solo a los necesarios
6. **Configurar backups** de los volúmenes de IPFS
7. **Implementar rate limiting** a nivel de proxy
8. **Monitorear logs** y métricas

## 📝 Notas Adicionales

- Los datos de IPFS se persisten en volúmenes de Docker
- El blockchain de Hardhat se reinicia cada vez que se reinicia el contenedor
- Para producción, considera usar una blockchain real (Sepolia, Mainnet)
- El backend está configurado para modo `production` en Docker
