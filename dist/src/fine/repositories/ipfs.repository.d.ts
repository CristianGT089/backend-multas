import { IIPFSRepository } from './interfaces/ipfs.repository.interface.js';
export declare class IPFSRepository implements IIPFSRepository {
    private static instance;
    private isInitialized;
    private localNodeUrl;
    private helia;
    private fs;
    private ipfsClient;
    private constructor();
    static getInstance(): IPFSRepository;
    initialize(): Promise<void>;
    isConnected(): Promise<boolean>;
    uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<string>;
    getFromIPFS(cid: string): Promise<Uint8Array[]>;
    getNodeUrl(): string;
}
