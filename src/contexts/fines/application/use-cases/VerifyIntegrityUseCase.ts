import { inject } from 'tsyringe';
import { Result } from '../../../../shared/domain/value-objects/Result.js';
import { UseCase } from '../../../../shared/application/decorators/UseCase.js';
import type {
    IVerifyIntegrityUseCase,
    VerifyIntegrityDTO,
    IntegrityDetailsDTO
} from '../../domain/ports/input/IVerifyIntegrityUseCase.js';
import type { IBlockchainPort } from '../../domain/ports/output/IBlockchainPort.js';
import { FineId } from '../../domain/value-objects/FineId.js';

@UseCase()
export class VerifyIntegrityUseCase implements IVerifyIntegrityUseCase {
    constructor(
        @inject('IBlockchainPort') private readonly blockchainPort: IBlockchainPort
    ) {}

    async execute(dto: VerifyIntegrityDTO): Promise<Result<IntegrityDetailsDTO>> {
        try {
            // 1. Validar el ID de la multa
            const fineIdVO = FineId.create(dto.fineId);

            // 2. Obtener la multa para obtener su CID
            const fineResult = await this.blockchainPort.getFineById(fineIdVO);
            if (!fineResult.isSuccess) {
                return Result.fail(fineResult.error!);
            }

            const fine = fineResult.value!;

            // 3. Verificar la integridad en blockchain
            const integrityResult = await this.blockchainPort.verifyIntegrity(fineIdVO);
            if (!integrityResult.isSuccess) {
                return Result.fail(integrityResult.error!);
            }

            const integrityData = integrityResult.value!;

            // 4. Preparar respuesta
            const response: IntegrityDetailsDTO = {
                fineId: dto.fineId,
                isValid: integrityData.isValid,
                registrationBlock: integrityData.registrationBlock,
                registrationTimestamp: integrityData.registrationTimestamp,
                statusHistoryLength: integrityData.statusHistoryLength,
                evidenceCID: fine.evidenceCID.value,
                dataHash: integrityData.dataHash
            };

            return Result.ok(response);
        } catch (error: any) {
            console.error('Error in VerifyIntegrityUseCase:', error);
            return Result.fail(`Failed to verify integrity: ${error.message}`);
        }
    }
}
