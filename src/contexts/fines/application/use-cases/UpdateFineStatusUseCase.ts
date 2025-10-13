import { inject } from 'tsyringe';
import { Result } from '../../../../shared/domain/value-objects/Result.js';
import { UseCase } from '../../../../shared/application/decorators/UseCase.js';
import type {
    IUpdateFineStatusUseCase,
    UpdateFineStatusDTO,
    UpdateFineStatusResponseDTO
} from '../../domain/ports/input/IUpdateFineStatusUseCase.js';
import type { IBlockchainPort } from '../../domain/ports/output/IBlockchainPort.js';
import { FineId } from '../../domain/value-objects/FineId.js';
import { FineState } from '../../domain/value-objects/FineState.js';

@UseCase()
export class UpdateFineStatusUseCase implements IUpdateFineStatusUseCase {
    constructor(
        @inject('IBlockchainPort') private readonly blockchainPort: IBlockchainPort
    ) {}

    async execute(dto: UpdateFineStatusDTO): Promise<Result<UpdateFineStatusResponseDTO>> {
        try {
            // 1. Validar el ID de la multa y el nuevo estado
            const fineIdVO = FineId.create(dto.fineId);
            const newStateVO = FineState.create(dto.newState);

            // 2. Obtener la multa actual
            const currentFineResult = await this.blockchainPort.getFineById(fineIdVO);
            if (!currentFineResult.isSuccess) {
                return Result.fail(currentFineResult.error!);
            }

            const currentFine = currentFineResult.value!;
            const previousState = currentFine.currentState.value;

            // 3. Validar transición de estado
            if (!currentFine.currentState.canTransitionTo(newStateVO)) {
                return Result.fail(
                    `Invalid state transition from ${currentFine.currentState.getDescription()} to ${newStateVO.getDescription()}`
                );
            }

            // 4. Actualizar estado en blockchain
            const updateResult = await this.blockchainPort.updateFineStatus(
                fineIdVO,
                newStateVO,
                dto.reason,
                dto.updatedBy
            );

            if (!updateResult.isSuccess) {
                return Result.fail(updateResult.error!);
            }

            const response: UpdateFineStatusResponseDTO = {
                fineId: dto.fineId,
                previousState,
                newState: dto.newState,
                transactionHash: updateResult.value!.txHash,
                timestamp: updateResult.value!.timestamp
            };

            return Result.ok(response);
        } catch (error: any) {
            console.error('Error in UpdateFineStatusUseCase:', error);
            return Result.fail(`Failed to update fine status: ${error.message}`);
        }
    }
}
