export interface IIPFSRepository {
    // Métodos de inicialización
    initialize(): Promise<void>;
    isConnected(): Promise<boolean>;
    
    // Métodos de gestión de archivos
    uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<string>;
    getFromIPFS(cid: string): Promise<Uint8Array[]>;
    
    // Métodos de utilidad
    getNodeUrl(): string;
} 