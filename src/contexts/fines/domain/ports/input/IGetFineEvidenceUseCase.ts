import { Result } from '../../../../../shared/index.js';

/**
 * Input Port: Get Fine Evidence Use Case
 * Define el contrato para obtener la evidencia de una multa desde IPFS
 */
export interface GetFineEvidenceDTO {
    evidenceCID: string;
}

export interface FineEvidenceResponseDTO {
    cid: string;
    data: Uint8Array[];
    mimeType: string;
    size: number;
}

export interface IGetFineEvidenceUseCase {
    execute(dto: GetFineEvidenceDTO): Promise<Result<FineEvidenceResponseDTO>>;
}
