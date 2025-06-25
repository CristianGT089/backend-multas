declare class IPFSService {
    private static instance;
    private repository;
    private constructor();
    static getInstance(): IPFSService;
    initialize(): Promise<void>;
    isConnected(): Promise<boolean>;
    uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<string>;
    getFromIPFS(cid: string): Promise<Uint8Array[]>;
}
export declare const ipfsService: IPFSService;
export {};
