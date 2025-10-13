import { injectable } from 'tsyringe';
import { Result } from '../../../../../shared/domain/value-objects/Result.js';
import type { IIPFSPort, UploadResult, FileMetadata } from '../../../domain/ports/output/IIPFSPort.js';
import { EvidenceCID } from '../../../domain/value-objects/EvidenceCID.js';
import { IPFSRepository } from '../../../../../fine/repositories/ipfs.repository.js';

/**
 * Adapter: Implementación de IIPFSPort
 * Adapta IPFSRepository (legacy) al puerto del dominio
 */
@injectable()
export class IPFSAdapter implements IIPFSPort {
    private readonly repository: IPFSRepository;

    constructor() {
        this.repository = IPFSRepository.getInstance();
    }

    async uploadFile(
        fileBuffer: Buffer,
        fileName: string,
        options?: { pin?: boolean; encrypt?: boolean }
    ): Promise<Result<UploadResult>> {
        try {
            const cid = await this.repository.uploadToIPFS(fileBuffer, fileName);

            return Result.ok({
                cid,
                size: fileBuffer.length,
                timestamp: new Date()
            });
        } catch (error: any) {
            return Result.fail(`Failed to upload file to IPFS: ${error.message}`);
        }
    }

    async getFile(cid: EvidenceCID): Promise<Result<{
        data: Uint8Array[];
        metadata?: FileMetadata;
    }>> {
        try {
            const data = await this.repository.getFromIPFS(cid.value);

            return Result.ok({
                data,
                metadata: {
                    cid: cid.value,
                    fileName: 'evidence', // No tenemos esta info del repository actual
                    mimeType: 'application/octet-stream', // No tenemos esta info
                    size: data.reduce((acc, chunk) => acc + chunk.length, 0),
                    uploadedAt: new Date() // No tenemos esta info
                }
            });
        } catch (error: any) {
            return Result.fail(`Failed to get file from IPFS: ${error.message}`);
        }
    }

    async fileExists(cid: EvidenceCID): Promise<Result<boolean>> {
        try {
            // Intentar obtener el archivo para verificar si existe
            const data = await this.repository.getFromIPFS(cid.value);
            return Result.ok(data.length > 0);
        } catch (error: any) {
            // Si falla, asumimos que no existe
            return Result.ok(false);
        }
    }

    async pinFile(cid: EvidenceCID): Promise<Result<void>> {
        // El repository actual no tiene soporte de pinning explícito
        // TODO: Implementar cuando se agregue al repository
        return Result.ok(undefined);
    }

    async unpinFile(cid: EvidenceCID): Promise<Result<void>> {
        // El repository actual no tiene soporte de unpinning explícito
        // TODO: Implementar cuando se agregue al repository
        return Result.ok(undefined);
    }

    async isConnected(): Promise<Result<boolean>> {
        try {
            const connected = await this.repository.isConnected();
            return Result.ok(connected);
        } catch (error: any) {
            return Result.fail(`Failed to check IPFS connection: ${error.message}`);
        }
    }

    async getNodeStats(): Promise<Result<{
        repoSize: number;
        numPinnedObjects: number;
        peers: number;
    }>> {
        // El repository actual no expone estadísticas del nodo
        // TODO: Implementar cuando se agregue al repository
        return Result.ok({
            repoSize: 0,
            numPinnedObjects: 0,
            peers: 0
        });
    }
}
