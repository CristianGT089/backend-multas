import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { CID } from 'multiformats/cid';
import { create } from 'ipfs-http-client';
import { IIPFSRepository } from './interfaces/ipfs.repository.interface.js';
import dotenv from 'dotenv';

dotenv.config();

export class IPFSRepository implements IIPFSRepository {
    private static instance: IPFSRepository;
    private isInitialized: boolean = false;
    private localNodeUrl: string;
    private helia: any;
    private fs: any;
    private ipfsClient: any;

    private constructor() {
        this.localNodeUrl = process.env.IPFS_NODE_URL || 'http://localhost:5001';
    }

    public static getInstance(): IPFSRepository {
        if (!IPFSRepository.instance) {
            IPFSRepository.instance = new IPFSRepository();
        }
        return IPFSRepository.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            console.log('Intentando conectar al nodo IPFS local en:', this.localNodeUrl);
            this.ipfsClient = create({ url: this.localNodeUrl });
            
            const { version, commit, repo } = await this.ipfsClient.version();
            console.log('Conectado al nodo IPFS local:', {
                version,
                commit,
                repo
            });

            console.log('Inicializando Helia como respaldo...');
            this.helia = await createHelia();
            this.fs = unixfs(this.helia);
            
            this.isInitialized = true;
            console.log('Servicio IPFS inicializado exitosamente');
        } catch (error) {
            console.error('Error al inicializar IPFS:', error);
            throw new Error('No se pudo conectar al nodo IPFS local. Asegúrate de que el daemon de IPFS esté corriendo.');
        }
    }

    public async isConnected(): Promise<boolean> {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            await this.ipfsClient.version();
            return true;
        } catch {
            return false;
        }
    }

    public async uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<string> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const result = await this.ipfsClient.add(fileBuffer);
            console.log('Archivo subido a IPFS local, CID:', result.path);
            return result.path;
        } catch (error) {
            console.error('Error al subir al nodo local, intentando con Helia:', error);
            const cid = await this.fs.addBytes(fileBuffer);
            console.log('Archivo subido con Helia, CID:', cid.toString());
            return cid.toString();
        }
    }

    public async getFromIPFS(cid: string): Promise<Uint8Array[]> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            console.log('Intentando obtener archivo de IPFS con CID:', cid);
            console.log('Estado de conexión IPFS:', await this.isConnected());
            
            try {
                console.log('Intentando obtener archivo del nodo local...');
                console.log('Verificando si el archivo existe en el nodo local...');
                
                const stats = await this.ipfsClient.files.stat(`/ipfs/${cid}`);
                console.log('Estadísticas del archivo:', stats);
                
                const stream = this.ipfsClient.cat(cid);
                const chunks: Uint8Array[] = [];
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
            } catch (error: any) {
                console.log('Error al obtener del nodo local, intentando con Helia:', error.message);
                
                const cidObj = CID.parse(cid);
                const chunks: Uint8Array[] = [];
                let chunkCount = 0;
                
                const timeout = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout al obtener archivo de IPFS')), 30000);
                });

                try {
                    await Promise.race([
                        (async () => {
                            for await (const chunk of this.fs.cat(cidObj)) {
                                chunks.push(chunk);
                                chunkCount++;
                                console.log(`Chunk ${chunkCount} recibido, tamaño: ${chunk.length} bytes`);
                            }
                        })(),
                        timeout
                    ]);
                } catch (timeoutError) {
                    console.error('Error de timeout:', timeoutError);
                    throw new Error('El archivo no pudo ser recuperado en el tiempo esperado');
                }
                
                if (chunks.length === 0) {
                    throw new Error('No se encontraron chunks para el CID proporcionado');
                }
                
                console.log(`Archivo recuperado exitosamente con Helia, total de chunks: ${chunkCount}`);
                return chunks;
            }
        } catch (error: unknown) {
            console.error('Error al obtener archivo de IPFS:', error);
            if (error instanceof Error) {
                throw new Error(`Error al obtener archivo de IPFS: ${error.message}`);
            }
            throw new Error('Error al obtener archivo de IPFS');
        }
    }

    public getNodeUrl(): string {
        return this.localNodeUrl;
    }
} 