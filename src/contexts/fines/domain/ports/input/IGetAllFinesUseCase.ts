import { Result } from '../../../../../shared/index.js';
import { FineDetailsDTO } from './IGetFineUseCase.js';

/**
 * Input Port: Get All Fines Use Case
 * Define el contrato para obtener todas las multas con paginación
 */
export interface GetAllFinesDTO {
    page: number;
    pageSize: number;
}

export interface GetAllFinesResponseDTO {
    fines: FineDetailsDTO[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

export interface IGetAllFinesUseCase {
    execute(dto: GetAllFinesDTO): Promise<Result<GetAllFinesResponseDTO>>;
}
