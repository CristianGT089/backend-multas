import { IPFSRepository } from '../repositories/ipfs.repository.js';
class IPFSService {
    static instance;
    repository;
    constructor() {
        this.repository = IPFSRepository.getInstance();
    }
    static getInstance() {
        if (!IPFSService.instance) {
            IPFSService.instance = new IPFSService();
        }
        return IPFSService.instance;
    }
    async initialize() {
        await this.repository.initialize();
    }
    async isConnected() {
        return this.repository.isConnected();
    }
    async uploadToIPFS(fileBuffer, fileName) {
        return this.repository.uploadToIPFS(fileBuffer, fileName);
    }
    async getFromIPFS(cid) {
        return this.repository.getFromIPFS(cid);
    }
}
// Exportar una instancia única del servicio
export const ipfsService = IPFSService.getInstance();
