import { inject } from 'tsyringe';
import { Result } from '../../../../shared/domain/value-objects/Result.js';
import { UseCase } from '../../../../shared/application/decorators/UseCase.js';
import type {
    IRegisterFineUseCase,
    RegisterFineDTO,
    RegisterFineResponseDTO
} from '../../domain/ports/input/IRegisterFineUseCase.js';
import type { IBlockchainPort } from '../../domain/ports/output/IBlockchainPort.js';
import type { IIPFSPort } from '../../domain/ports/output/IIPFSPort.js';
import { PlateNumber } from '../../domain/value-objects/PlateNumber.js';
import { Location } from '../../domain/value-objects/Location.js';
import { InfractionType } from '../../domain/value-objects/InfractionType.js';
import { Cost } from '../../domain/value-objects/Cost.js';
import { EvidenceCID } from '../../domain/value-objects/EvidenceCID.js';
import { FineId } from '../../domain/value-objects/FineId.js';
import { FineState, FineStateEnum } from '../../domain/value-objects/FineState.js';
import { Fine } from '../../domain/entities/Fine.js';

@UseCase()
export class RegisterFineUseCase implements IRegisterFineUseCase {
    constructor(
        @inject('IIPFSPort') private readonly ipfsPort: IIPFSPort,
        @inject('IBlockchainPort') private readonly blockchainPort: IBlockchainPort
    ) {}

    async execute(dto: RegisterFineDTO): Promise<Result<RegisterFineResponseDTO>> {
        try {
            // 1. Validar datos de entrada usando Value Objects
            const plateNumber = PlateNumber.create(dto.plateNumber);
            const location = Location.create(dto.location);
            const infractionType = InfractionType.create(dto.infractionType);
            const cost = Cost.create(dto.cost);

            // 2. Subir evidencia a IPFS
            const uploadResult = await this.ipfsPort.uploadFile(
                dto.file.buffer,
                dto.file.originalname
            );

            if (!uploadResult.isSuccess) {
                return Result.fail(uploadResult.error!);
            }

            const evidenceCID = EvidenceCID.create(uploadResult.value!.cid);

            // 3. Crear entidad Fine temporal (sin ID aún)
            const tempFine = new Fine(
                FineId.create(0), // Temporal, será reemplazado por blockchain
                plateNumber,
                evidenceCID,
                location,
                infractionType,
                cost,
                dto.ownerIdentifier,
                FineState.create(FineStateEnum.PENDING),
                dto.registeredBy,
                new Date(),
                dto.externalSystemId || ''
            );

            // 4. Registrar multa en blockchain
            const blockchainResult = await this.blockchainPort.registerFine(tempFine);

            if (!blockchainResult.isSuccess) {
                return Result.fail(blockchainResult.error!);
            }

            const blockchainData = blockchainResult.value!;

            // 5. Preparar respuesta
            const response: RegisterFineResponseDTO = {
                fineId: blockchainData.fineId,
                evidenceCID: evidenceCID.value,
                transactionHash: blockchainData.txHash,
                timestamp: blockchainData.timestamp
            };

            return Result.ok(response);
        } catch (error: any) {
            console.error('Error in RegisterFineUseCase:', error);
            return Result.fail(`Failed to register fine: ${error.message}`);
        }
    }
}
