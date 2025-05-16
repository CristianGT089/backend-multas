import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { CID } from 'multiformats/cid';
import dotenv from 'dotenv';
import { create } from 'ipfs-http-client';

dotenv.config();

let helia: any;
let fs: any;
let ipfsClient: any;

class IPFSService {
    private static instance: IPFSService;
    private isInitialized: boolean = false;
    private localNodeUrl: string;

    private constructor() {
        // Configuración del nodo IPFS local
        this.localNodeUrl = process.env.IPFS_NODE_URL || 'http://localhost:5001';
    }

    public static getInstance(): IPFSService {
        if (!IPFSService.instance) {
            IPFSService.instance = new IPFSService();
        }
        return IPFSService.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Inicializar cliente IPFS local
            console.log('Intentando conectar al nodo IPFS local en:', this.localNodeUrl);
            ipfsClient = create({ url: this.localNodeUrl });
            
            // Verificar conexión con el nodo local
            const { version, commit, repo } = await ipfsClient.version();
            console.log('Conectado al nodo IPFS local:', {
                version,
                commit,
                repo
            });

            // Inicializar Helia como respaldo
            console.log('Inicializando Helia como respaldo...');
            helia = await createHelia();
            fs = unixfs(helia);
            
            this.isInitialized = true;
            console.log('Servicio IPFS inicializado exitosamente');
        } catch (error) {
            console.error('Error al inicializar IPFS:', error);
            throw new Error('No se pudo conectar al nodo IPFS local. Asegúrate de que el daemon de IPFS esté corriendo.');
        }
    }

    public async uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<string> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            // Intentar primero con el nodo local
            const result = await ipfsClient.add(fileBuffer);
            console.log('Archivo subido a IPFS local, CID:', result.path);
            return result.path;
        } catch (error) {
            console.error('Error al subir al nodo local, intentando con Helia:', error);
            // Fallback a Helia si el nodo local falla
            const cid = await fs.addBytes(fileBuffer);
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
            
            // Intentar primero con el nodo local
            try {
                console.log('Intentando obtener archivo del nodo local...');
                console.log('Verificando si el archivo existe en el nodo local...');
                
                // Verificar si el archivo existe
                const stats = await ipfsClient.files.stat(`/ipfs/${cid}`);
                console.log('Estadísticas del archivo:', stats);
                
                const stream = ipfsClient.cat(cid);
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
                
                // Fallback a Helia si el nodo local falla
                const cidObj = CID.parse(cid);
                const chunks: Uint8Array[] = [];
                let chunkCount = 0;
                
                const timeout = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout al obtener archivo de IPFS')), 30000);
                });

                try {
                    await Promise.race([
                        (async () => {
                            for await (const chunk of fs.cat(cidObj)) {
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
        } catch (error: any) {
            console.error('Error detallado al obtener archivo de IPFS:', {
                cid,
                error: error.message,
                stack: error.stack,
                type: error.name
            });
            
            if (error.message.includes('not found')) {
                throw new Error(`El archivo con CID ${cid} no fue encontrado en IPFS`);
            }
            
            if (error.message.includes('parse')) {
                throw new Error(`CID inválido: ${cid}`);
            }
            
            throw new Error(`Error al obtener archivo de IPFS: ${error.message}`);
        }
    }

    public async isConnected(): Promise<boolean> {
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            await ipfsClient.version();
            return true;
        } catch {
            return false;
        }
    }
}

// Exportar una instancia única del servicio
export const ipfsService = IPFSService.getInstance();