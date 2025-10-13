import { Result } from '../../../../../shared/index.js';
import { FineDetailsDTO } from './IGetFineUseCase.js';

/**
 * Input Port: Get Fines By Plate Use Case
 * Define el contrato para buscar multas por placa
 */
export interface GetFinesByPlateDTO {
    plateNumber: string;
}

export interface IGetFinesByPlateUseCase {
    execute(dto: GetFinesByPlateDTO): Promise<Result<FineDetailsDTO[]>>;
}
