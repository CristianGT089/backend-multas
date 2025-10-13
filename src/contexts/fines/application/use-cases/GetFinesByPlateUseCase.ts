import { inject } from 'tsyringe';
import { Result } from '../../../../shared/domain/value-objects/Result.js';
import { UseCase } from '../../../../shared/application/decorators/UseCase.js';
import type {
    IGetFinesByPlateUseCase,
    GetFinesByPlateDTO
} from '../../domain/ports/input/IGetFinesByPlateUseCase.js';
import type { IBlockchainPort } from '../../domain/ports/output/IBlockchainPort.js';
import { PlateNumber } from '../../domain/value-objects/PlateNumber.js';
import { FineMapper } from '../mappers/FineMapper.js';
import type { FineDetailsDTO } from '../../domain/ports/input/IGetFineUseCase.js';

@UseCase()
export class GetFinesByPlateUseCase implements IGetFinesByPlateUseCase {
    constructor(
        @inject('IBlockchainPort') private readonly blockchainPort: IBlockchainPort
    ) {}

    async execute(dto: GetFinesByPlateDTO): Promise<Result<FineDetailsDTO[]>> {
        try {
            // 1. Validar el número de placa
            const plateNumber = PlateNumber.create(dto.plateNumber);

            // 2. Obtener multas por placa directamente
            const finesResult = await this.blockchainPort.getFinesByPlate(plateNumber.value);

            if (!finesResult.isSuccess) {
                return Result.fail(finesResult.error!);
            }

            const fines = finesResult.value!;

            // 3. Mapear a DTOs
            const finesDTO = FineMapper.toDetailsDTOList(fines);

            return Result.ok(finesDTO);
        } catch (error: any) {
            console.error('Error in GetFinesByPlateUseCase:', error);
            return Result.fail(`Failed to get fines by plate: ${error.message}`);
        }
    }
}
