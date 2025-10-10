/**
 * Service Factory para Arquitectura Híbrida Blockchain
 * Elimina el patrón Singleton y centraliza la gestión de dependencias
 */

import { HyperledgerService } from './hyperledger.service.stub.js';
import { EthereumService } from './ethereum.service.stub.js';
import { SyncService } from './sync.service.stub.js';
import { IPFSService } from './ipfs.service.js';
// import { AuditService } from './audit.service.js';
// import { CacheService } from './cache.service.js';
// import { QueueService } from './queue.service.js';

export class ServiceFactory {
    private static hyperledgerService: HyperledgerService;
    private static ethereumService: EthereumService;
    private static syncService: SyncService;
    private static ipfsService: IPFSService;
    // private static auditService: AuditService;
    // private static cacheService: CacheService;
    // private static queueService: QueueService;

    /**
     * Obtiene instancia de HyperledgerService
     */
    static getHyperledgerService(): HyperledgerService {
        if (!this.hyperledgerService) {
            this.hyperledgerService = new HyperledgerService();
        }
        return this.hyperledgerService;
    }

    /**
     * Obtiene instancia de EthereumService
     */
    static getEthereumService(): EthereumService {
        if (!this.ethereumService) {
            this.ethereumService = new EthereumService();
        }
        return this.ethereumService;
    }

    /**
     * Obtiene instancia de SyncService
     */
    static getSyncService(): SyncService {
        if (!this.syncService) {
            this.syncService = new SyncService(
                this.getHyperledgerService(),
                this.getEthereumService()
                // this.getAuditService() // Comentado hasta implementar AuditService
            );
        }
        return this.syncService;
    }

    /**
     * Obtiene instancia de IPFSService
     */
    static getIPFSService(): IPFSService {
        if (!this.ipfsService) {
            this.ipfsService = IPFSService.getInstance();
        }
        return this.ipfsService;
    }

    // /**
    //  * Obtiene instancia de AuditService
    //  */
    // static getAuditService(): AuditService {
    //     if (!this.auditService) {
    //         this.auditService = new AuditService(
    //             this.getHyperledgerService(),
    //             this.getEthereumService()
    //         );
    //     }
    //     return this.auditService;
    // }

    // /**
    //  * Obtiene instancia de CacheService
    //  */
    // static getCacheService(): CacheService {
    //     if (!this.cacheService) {
    //         this.cacheService = new CacheService();
    //     }
    //     return this.cacheService;
    // }

    // /**
    //  * Obtiene instancia de QueueService
    //  */
    // static getQueueService(): QueueService {
    //     if (!this.queueService) {
    //         this.queueService = new QueueService();
    //     }
    //     return this.queueService;
    // }

    /**
     * Reinicia todas las instancias (útil para testing)
     */
    static resetInstances(): void {
        this.hyperledgerService = undefined as any;
        this.ethereumService = undefined as any;
        this.syncService = undefined as any;
        this.ipfsService = undefined as any;
        // this.auditService = undefined as any;
        // this.cacheService = undefined as any;
        // this.queueService = undefined as any;
    }

    /**
     * Verifica el estado de todos los servicios
     */
    static async healthCheck(): Promise<{
        hyperledger: boolean;
        ethereum: boolean;
        ipfs: boolean;
        // cache: boolean;
        // queue: boolean;
    }> {
        const results = {
            hyperledger: false,
            ethereum: false,
            ipfs: false
            // cache: false,
            // queue: false
        };

        try {
            // Verificar Hyperledger
            const hyperledgerService = this.getHyperledgerService();
            results.hyperledger = await hyperledgerService.isConnected();
        } catch (error) {
            console.error('Hyperledger health check failed:', error);
        }

        try {
            // Verificar Ethereum
            const ethereumService = this.getEthereumService();
            results.ethereum = await ethereumService.isConnected();
        } catch (error) {
            console.error('Ethereum health check failed:', error);
        }

        try {
            // Verificar IPFS
            const ipfsService = this.getIPFSService();
            results.ipfs = await ipfsService.isConnected();
        } catch (error) {
            console.error('IPFS health check failed:', error);
        }

        // try {
        //     // Verificar Cache
        //     const cacheService = this.getCacheService();
        //     results.cache = await cacheService.isConnected();
        // } catch (error) {
        //     console.error('Cache health check failed:', error);
        // }

        // try {
        //     // Verificar Queue
        //     const queueService = this.getQueueService();
        //     results.queue = await queueService.isConnected();
        // } catch (error) {
        //     console.error('Queue health check failed:', error);
        // }

        return results;
    }

    /**
     * Inicializa todos los servicios necesarios
     */
    static async initializeServices(): Promise<void> {
        console.log('Initializing hybrid blockchain services...');
        
        try {
            // Inicializar servicios en orden de dependencia
            await this.getIPFSService().initialize();
            // await this.getCacheService().initialize();
            // await this.getQueueService().initialize();
            await this.getHyperledgerService().initialize();
            await this.getEthereumService().initialize();
            // await this.getAuditService().initialize();
            await this.getSyncService().initialize();

            console.log('All services initialized successfully');
        } catch (error) {
            console.error('Failed to initialize services:', error);
            throw error;
        }
    }

    /**
     * Cierra todas las conexiones
     */
    static async shutdownServices(): Promise<void> {
        console.log('Shutting down hybrid blockchain services...');
        
        try {
            const services = [
                // this.queueService,
                // this.cacheService,
                this.syncService,
                // this.auditService,
                this.hyperledgerService,
                this.ethereumService,
                this.ipfsService
            ];

            for (const service of services) {
                if (service && typeof (service as any).shutdown === 'function') {
                    await (service as any).shutdown();
                }
            }

            console.log('All services shut down successfully');
        } catch (error) {
            console.error('Error during service shutdown:', error);
        }
    }
}
