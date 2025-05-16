export interface CreateFinePayload {
    plateNumber: string;
    location: string;
    infractionType: string;
    cost: number; // Costo como número
    ownerIdentifier: string;
    externalSystemId?: string; // ID externo opcional
    offenseTimestamp?: number; // Unix timestamp de la infracción (opcional)
} 