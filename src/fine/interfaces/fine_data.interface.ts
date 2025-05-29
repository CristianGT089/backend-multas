export interface FineData {
    plateNumber: string;
    location: string;
    infractionType: string;
    cost: number;
    ownerIdentifier: string;
    externalSystemId?: string;
    offenseTimestamp?: number;
    image?: File;
} 