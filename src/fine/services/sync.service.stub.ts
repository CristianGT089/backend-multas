/**
 * Stub temporal para SyncService
 * Este archivo será reemplazado por la implementación completa
 */

export class SyncService {
    constructor(
        private hyperledgerService: any,
        private ethereumService: any
    ) {}

    async initialize(): Promise<void> {
        console.log('SyncService stub initialized');
    }

    async shutdown(): Promise<void> {
        console.log('SyncService stub shut down');
    }
}
