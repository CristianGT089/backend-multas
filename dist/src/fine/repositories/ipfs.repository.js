import { create } from 'ipfs-http-client';
import { ipfsConfig } from '../../../clients/ipfs/config.js';
import dotenv from 'dotenv';
dotenv.config();
export class IPFSRepository {
    static instance;
    isInitialized = false;
    localNodeUrl;
    ipfsClient;
    constructor() {
        this.localNodeUrl = ipfsConfig.apiUrl;
    }
    static getInstance() {
        if (!IPFSRepository.instance) {
            IPFSRepository.instance = new IPFSRepository();
        }
        return IPFSRepository.instance;
    }
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            console.log('Conectando al nodo IPFS local en:', this.localNodeUrl);
            this.ipfsClient = create({ url: this.localNodeUrl });
            const { version, commit, repo } = await this.ipfsClient.version();
            console.log('Conectado al nodo IPFS local:', {
                version,
                commit,
                repo
            });
            this.isInitialized = true;
            console.log('Servicio IPFS inicializado exitosamente');
        }
        catch (error) {
            console.error('Error al inicializar IPFS:', error);
            throw new Error('No se pudo conectar al nodo IPFS local. Asegúrate de que el daemon de IPFS esté corriendo.');
        }
    }
    async isConnected() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            await this.ipfsClient.version();
            return true;
        }
        catch {
            return false;
        }
    }
    async uploadToIPFS(fileBuffer, fileName) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            const result = await this.ipfsClient.add(fileBuffer);
            console.log('Archivo subido a IPFS local, CID:', result.path);
            return result.path;
        }
        catch (error) {
            console.error('Error al subir archivo a IPFS:', error);
            throw new Error(`Error al subir archivo a IPFS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
    async getFromIPFS(cid) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            console.log('Obteniendo archivo de IPFS con CID:', cid);
            const stream = this.ipfsClient.cat(cid);
            const chunks = [];
            let totalSize = 0;
            for await (const chunk of stream) {
                chunks.push(chunk);
                totalSize += chunk.length;
                console.log(`Chunk recibido, tamaño actual: ${totalSize} bytes`);
            }
            if (chunks.length === 0) {
                throw new Error('No se encontraron datos para el CID proporcionado');
            }
            console.log('Archivo obtenido exitosamente del nodo local, tamaño total:', totalSize, 'bytes');
            return chunks;
        }
        catch (error) {
            console.error('Error al obtener archivo de IPFS:', error);
            if (error instanceof Error) {
                throw new Error(`Error al obtener archivo de IPFS: ${error.message}`);
            }
            throw new Error('Error al obtener archivo de IPFS');
        }
    }
    getNodeUrl() {
        return this.localNodeUrl;
    }
}
