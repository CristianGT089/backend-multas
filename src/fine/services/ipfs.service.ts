import { IPFSRepository } from '../repositories/ipfs.repository.js';

export class IPFSService {
    private static instance: IPFSService;
    private repository: IPFSRepository;

    private constructor() {
        this.repository = IPFSRepository.getInstance();
    }

    public static getInstance(): IPFSService {
        if (!IPFSService.instance) {
            IPFSService.instance = new IPFSService();
        }
        return IPFSService.instance;
    }

    public async initialize(): Promise<void> {
        await this.repository.initialize();
    }

    public async isConnected(): Promise<boolean> {
        return this.repository.isConnected();
    }

    public async uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<string> {
        return this.repository.uploadToIPFS(fileBuffer, fileName);
    }

    public async getFromIPFS(cid: string): Promise<Uint8Array[]> {
        return this.repository.getFromIPFS(cid);
    }
}