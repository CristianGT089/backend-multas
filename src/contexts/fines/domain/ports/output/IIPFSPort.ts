import { Result } from '../../../../../shared/index.js';
import { EvidenceCID } from '../../value-objects/EvidenceCID.js';

/**
 * Output Port: IPFS Storage
 * Define el contrato para operaciones con IPFS
 */
export interface UploadResult {
    cid: string;
    size: number;
    timestamp: Date;
}

export interface FileMetadata {
    cid: string;
    fileName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
}

export interface IIPFSPort {
    /**
     * Sube un archivo a IPFS
     */
    uploadFile(
        fileBuffer: Buffer,
        fileName: string,
        options?: {
            pin?: boolean;
            encrypt?: boolean;
        }
    ): Promise<Result<UploadResult>>;

    /**
     * Recupera un archivo desde IPFS
     */
    getFile(cid: EvidenceCID): Promise<Result<{
        data: Uint8Array[];
        metadata?: FileMetadata;
    }>>;

    /**
     * Verifica si un archivo existe en IPFS
     */
    fileExists(cid: EvidenceCID): Promise<Result<boolean>>;

    /**
     * Pin de un archivo (mantenerlo disponible)
     */
    pinFile(cid: EvidenceCID): Promise<Result<void>>;

    /**
     * Unpin de un archivo
     */
    unpinFile(cid: EvidenceCID): Promise<Result<void>>;

    /**
     * Verifica la conectividad con IPFS
     */
    isConnected(): Promise<Result<boolean>>;

    /**
     * Obtiene las estadísticas del nodo IPFS
     */
    getNodeStats(): Promise<Result<{
        repoSize: number;
        numPinnedObjects: number;
        peers: number;
    }>>;
}
