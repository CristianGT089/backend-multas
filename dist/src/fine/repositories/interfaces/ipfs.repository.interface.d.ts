export interface IIPFSRepository {
    initialize(): Promise<void>;
    isConnected(): Promise<boolean>;
    uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<string>;
    getFromIPFS(cid: string): Promise<Uint8Array[]>;
    getNodeUrl(): string;
}
