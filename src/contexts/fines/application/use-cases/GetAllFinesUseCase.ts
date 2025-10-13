import { inject } from 'tsyringe';
import { Result } from '../../../../shared/domain/value-objects/Result.js';
import { UseCase } from '../../../../shared/application/decorators/UseCase.js';
import type {
    IGetAllFinesUseCase,
    GetAllFinesDTO,
    GetAllFinesResponseDTO
} from '../../domain/ports/input/IGetAllFinesUseCase.js';
import type { IBlockchainPort } from '../../domain/ports/output/IBlockchainPort.js';
import { FineMapper } from '../mappers/FineMapper.js';

@UseCase()
export class GetAllFinesUseCase implements IGetAllFinesUseCase {
    constructor(
        @inject('IBlockchainPort') private readonly blockchainPort: IBlockchainPort
    ) {}

    async execute(dto: GetAllFinesDTO): Promise<Result<GetAllFinesResponseDTO>> {
        try {
            // 1. Validar parámetros de paginación
            const page = dto.page || 1;
            const pageSize = dto.pageSize || 10;

            if (page < 1) {
                return Result.fail('Page number must be greater than 0');
            }

            if (pageSize < 1 || pageSize > 100) {
                return Result.fail('Page size must be between 1 and 100');
            }

            // 2. Obtener multas paginadas
            const finesResult = await this.blockchainPort.getAllFines(page, pageSize);
            if (!finesResult.isSuccess) {
                return Result.fail(finesResult.error!);
            }

            const fines = finesResult.value!;

            // 3. Obtener el total de multas
            const totalResult = await this.blockchainPort.getTotalFines();
            if (!totalResult.isSuccess) {
                return Result.fail(totalResult.error!);
            }

            const totalFines = totalResult.value!;
            const totalPages = Math.ceil(totalFines / pageSize);

            // 4. Mapear a DTOs
            const finesDTO = FineMapper.toDetailsDTOList(fines);

            const response: GetAllFinesResponseDTO = {
                fines: finesDTO,
                pagination: {
                    currentPage: page,
                    pageSize,
                    totalItems: totalFines,
                    totalPages
                }
            };

            return Result.ok(response);
        } catch (error: any) {
            console.error('Error in GetAllFinesUseCase:', error);
            return Result.fail(`Failed to get all fines: ${error.message}`);
        }
    }
}
