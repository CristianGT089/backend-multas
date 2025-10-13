import { Result } from '../../../../../shared/index.js';

/**
 * Output Port: SIMIT External API
 * Define el contrato para integración con el Sistema Integrado de Información
 * sobre Multas y Sanciones por Infracciones de Tránsito
 */
export interface SimitFineData {
    simitId: string;
    plateNumber: string;
    infractionType: string;
    infractionDate: Date;
    location: string;
    cost: number;
    status: 'PENDING' | 'PAID' | 'IN_PROCESS' | 'CANCELLED';
    paymentDeadline: Date;
}

export interface VehicleData {
    plateNumber: string;
    vehicleType: string;
    brand: string;
    model: string;
    year: number;
    ownerName: string;
    ownerDocument: string;
}

export interface DriverData {
    licenseNumber: string;
    name: string;
    documentNumber: string;
    licenseType: string;
    expirationDate: Date;
    penaltyPoints: number;
}

export interface ISimitPort {
    /**
     * Consulta una multa en SIMIT por ID
     */
    getFineById(simitId: string): Promise<Result<SimitFineData>>;

    /**
     * Consulta multas por placa en SIMIT
     */
    getFinesByPlate(plateNumber: string): Promise<Result<SimitFineData[]>>;

    /**
     * Consulta información de un vehículo en el RUNT
     */
    getVehicleData(plateNumber: string): Promise<Result<VehicleData>>;

    /**
     * Consulta información de un conductor en el RUNT
     */
    getDriverData(licenseNumber: string): Promise<Result<DriverData>>;

    /**
     * Registra una nueva multa en SIMIT
     */
    registerFine(fineData: Omit<SimitFineData, 'simitId' | 'status'>): Promise<Result<{
        simitId: string;
        registeredAt: Date;
    }>>;

    /**
     * Actualiza el estado de una multa en SIMIT
     */
    updateFineStatus(
        simitId: string,
        newStatus: SimitFineData['status']
    ): Promise<Result<void>>;

    /**
     * Verifica la conectividad con la API de SIMIT
     */
    checkConnection(): Promise<Result<boolean>>;
}
