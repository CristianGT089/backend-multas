import { inject } from 'tsyringe';
import { Result } from '../../../../shared/domain/value-objects/Result.js';
import { UseCase } from '../../../../shared/application/decorators/UseCase.js';
import type {
    IGetFineEvidenceUseCase,
    GetFineEvidenceDTO,
    FineEvidenceResponseDTO
} from '../../domain/ports/input/IGetFineEvidenceUseCase.js';
import type { IIPFSPort } from '../../domain/ports/output/IIPFSPort.js';
import { EvidenceCID } from '../../domain/value-objects/EvidenceCID.js';

@UseCase()
export class GetFineEvidenceUseCase implements IGetFineEvidenceUseCase {
    constructor(
        @inject('IIPFSPort') private readonly ipfsPort: IIPFSPort
    ) {}

    async execute(dto: GetFineEvidenceDTO): Promise<Result<FineEvidenceResponseDTO>> {
        try {
            // 1. Validar el CID de evidencia
            const evidenceCID = EvidenceCID.create(dto.evidenceCID);

            // 2. Obtener el archivo de IPFS
            const fileResult = await this.ipfsPort.getFile(evidenceCID);
            if (!fileResult.isSuccess) {
                return Result.fail(fileResult.error!);
            }

            const fileData = fileResult.value!;

            // 3. Preparar respuesta
            const response: FineEvidenceResponseDTO = {
                cid: dto.evidenceCID,
                data: fileData.data,
                mimeType: fileData.metadata?.mimeType || 'application/octet-stream',
                size: fileData.metadata?.size || 0
            };

            return Result.ok(response);
        } catch (error: any) {
            console.error('Error in GetFineEvidenceUseCase:', error);
            return Result.fail(`Failed to get fine evidence: ${error.message}`);
        }
    }
}
