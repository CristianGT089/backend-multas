// Entities
export { Fine } from './entities/index.js';

// Value Objects
export {
    FineId,
    PlateNumber,
    EvidenceCID,
    InfractionType,
    InfractionTypeEnum,
    Location,
    Cost,
    FineState,
    FineStateEnum
} from './value-objects/index.js';

// Input Ports (Use Cases)
export * from './ports/input/index.js';

// Output Ports (Repositories & External Services)
export * from './ports/output/index.js';
