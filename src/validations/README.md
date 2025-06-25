# Sistema de Validaciones - Fotomultas Backend

## Descripción General

El sistema de validaciones implementa validaciones robustas para todos los endpoints de la API de fotomultas, utilizando `express-validator` para validaciones de datos y middleware personalizado para validaciones de archivos.

## Estructura

```
src/validations/
├── index.ts                 # Exportaciones centralizadas
├── fineValidations.ts       # Validaciones para multas
├── fileValidations.ts       # Validaciones para archivos
└── README.md               # Esta documentación

src/middleware/
└── validation.ts           # Middleware de validación centralizado
```

## Validaciones Implementadas

### 1. Validaciones de Multas (`fineValidations.ts`)

#### Crear Multa (`createFineValidations`)
- **Placa**: Formato AAA123 (3 letras + 3 números)
- **Tipo de Infracción**: Valores permitidos: EXCESO_VELOCIDAD, SEMAFORO_ROJO, ESTACIONAMIENTO_PROHIBIDO, OTRO
- **Ubicación**: 10-200 caracteres
- **Costo**: $10,000 - $1,000,000
- **Descripción**: Opcional, máximo 500 caracteres
- **Fecha**: Formato ISO 8601 (opcional)

#### Actualizar Multa (`updateFineValidations`)
- **ID**: UUID válido
- **Estado**: PENDIENTE, PAGADA, APELADA, ANULADA
- **Costo**: $10,000 - $1,000,000 (opcional)
- **Descripción**: Máximo 500 caracteres (opcional)

#### Obtener Multas (`getFinesValidations`)
- **Página**: Número entero > 0
- **Límite**: 1-100 registros
- **Placa**: Formato AAA123 (opcional)
- **Estado**: Estados válidos (opcional)
- **Fechas**: Formato ISO 8601 (opcional)

#### Otras Validaciones
- **Obtener Multa**: UUID válido
- **Eliminar Multa**: UUID válido
- **Pagar Multa**: UUID + método de pago válido
- **Apelar Multa**: UUID + razón (20-1000 caracteres)

### 2. Validaciones de Archivos (`fileValidations.ts`)

#### Tipos Permitidos
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

#### Límites
- **Tamaño máximo**: 5MB
- **Validación automática**: Tipo MIME y tamaño

### 3. Middleware de Validación (`validation.ts`)

#### `validate(validations)`
Middleware que ejecuta validaciones de express-validator y maneja errores automáticamente.

#### `validateFile(allowedTypes, maxSize)`
Middleware que valida archivos subidos (tipo, tamaño, existencia).

## Uso en Rutas

### Ejemplo Básico
```typescript
import { validate, getFinesValidations } from '../validations/index.js';

router.get('/', validate(getFinesValidations), controller.getFines);
```

### Ejemplo con Archivo
```typescript
import { validate, validateFile, uploadInfractionPhotoValidations, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '../validations/index.js';

router.post('/', 
  upload.single('evidenceFile'),
  validateFile(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE),
  validate(uploadInfractionPhotoValidations),
  controller.registerFine
);
```

## Respuestas de Error

Las validaciones devuelven errores en formato JSON:

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "plate",
      "message": "La placa debe tener el formato AAA123",
      "value": "ABC123"
    }
  ]
}
```

## Validaciones Específicas por Endpoint

### GET /api/fines
- Validación de parámetros de consulta (paginación, filtros)

### POST /api/fines
- Validación de archivo (tipo, tamaño)
- Validación de datos de multa
- Validación de formato de placa colombiana

### GET /api/fines/:id
- Validación de UUID

### PUT /api/fines/:id/status
- Validación de UUID
- Validación de nuevo estado

## Formato de Placa Colombiana

Las validaciones implementan el formato oficial colombiano:
- **Patrón**: `^[A-Z]{3}[0-9]{3}$`
- **Ejemplo**: `ABC123`
- **3 letras mayúsculas + 3 números**

## Estados de Multa Válidos

- `PENDIENTE`: Multa registrada, pendiente de pago
- `PAGADA`: Multa pagada completamente
- `APELADA`: Multa en proceso de apelación
- `ANULADA`: Multa anulada por autoridad competente

## Métodos de Pago Válidos

- `TARJETA_CREDITO`: Pago con tarjeta de crédito
- `TARJETA_DEBITO`: Pago con tarjeta de débito
- `TRANSFERENCIA`: Pago por transferencia bancaria
- `EFECTIVO`: Pago en efectivo

## Extensibilidad

Para agregar nuevas validaciones:

1. Crear validaciones en el archivo correspondiente
2. Exportar desde `index.ts`
3. Aplicar en las rutas usando `validate()`

### Ejemplo de Nueva Validación
```typescript
// En fineValidations.ts
export const newValidation = [
  body('field')
    .trim()
    .notEmpty()
    .withMessage('Campo requerido')
];

// En index.ts
export { newValidation } from './fineValidations';

// En rutas
router.post('/new', validate(newValidation), controller.newMethod);
``` 