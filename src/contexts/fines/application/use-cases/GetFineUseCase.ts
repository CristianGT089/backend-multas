import { inject } from 'tsyringe';
import { Result } from '../../../../shared/domain/value-objects/Result.js';
import { UseCase } from '../../../../shared/application/decorators/UseCase.js';
import type { IGetFineUseCase, FineDetailsDTO } from '../../domain/ports/input/IGetFineUseCase.js';
import type { IBlockchainPort } from '../../domain/ports/output/IBlockchainPort.js';
import { FineId } from '../../domain/value-objects/FineId.js';
import { FineMapper } from '../mappers/FineMapper.js';

@UseCase()
export class GetFineUseCase implements IGetFineUseCase {
    constructor(
        @inject('IBlockchainPort') private readonly blockchainPort: IBlockchainPort
    ) {}

    async execute(fineId: number): Promise<Result<FineDetailsDTO>> {
        try {
            // 1. Validar el ID y crear Value Object
            const fineIdVO = FineId.create(fineId);

            // 2. Obtener la multa desde blockchain
            const fineResult = await this.blockchainPort.getFineById(fineIdVO);
            if (!fineResult.isSuccess) {
                return Result.fail(fineResult.error!);
            }

            // 3. Mapear a DTO
            const fineEntity = fineResult.value!;
            const dto = FineMapper.toDetailsDTO(fineEntity);

            return Result.ok(dto);
        } catch (error: any) {
            console.error('Error in GetFineUseCase:', error);
            return Result.fail(`Failed to get fine: ${error.message}`);
        }
    }
}
