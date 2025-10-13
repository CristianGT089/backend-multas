import 'reflect-metadata';
import { container } from 'tsyringe';

// Use Cases
import { RegisterFineUseCase } from '../../application/use-cases/RegisterFineUseCase.js';
import { GetFineUseCase } from '../../application/use-cases/GetFineUseCase.js';
import { UpdateFineStatusUseCase } from '../../application/use-cases/UpdateFineStatusUseCase.js';
import { GetAllFinesUseCase } from '../../application/use-cases/GetAllFinesUseCase.js';
import { GetFinesByPlateUseCase } from '../../application/use-cases/GetFinesByPlateUseCase.js';
import { VerifyIntegrityUseCase } from '../../application/use-cases/VerifyIntegrityUseCase.js';
import { GetFineEvidenceUseCase } from '../../application/use-cases/GetFineEvidenceUseCase.js';

// Port Interfaces
import type { IRegisterFineUseCase } from '../../domain/ports/input/IRegisterFineUseCase.js';
import type { IGetFineUseCase } from '../../domain/ports/input/IGetFineUseCase.js';
import type { IUpdateFineStatusUseCase } from '../../domain/ports/input/IUpdateFineStatusUseCase.js';
import type { IGetAllFinesUseCase } from '../../domain/ports/input/IGetAllFinesUseCase.js';
import type { IGetFinesByPlateUseCase } from '../../domain/ports/input/IGetFinesByPlateUseCase.js';
import type { IVerifyIntegrityUseCase } from '../../domain/ports/input/IVerifyIntegrityUseCase.js';
import type { IGetFineEvidenceUseCase } from '../../domain/ports/input/IGetFineEvidenceUseCase.js';

import type { IBlockchainPort } from '../../domain/ports/output/IBlockchainPort.js';
import type { IIPFSPort } from '../../domain/ports/output/IIPFSPort.js';

// Adapters
import { EthereumBlockchainAdapter } from '../adapters/blockchain/EthereumBlockchainAdapter.js';
import { IPFSAdapter } from '../adapters/ipfs/IPFSAdapter.js';

/**
 * Configuración del contenedor de dependencias para el contexto de multas
 */
export function configureFinesDependencies(): void {
    // Registrar Output Adapters (Infrastructure)
    container.register<IBlockchainPort>('IBlockchainPort', {
        useClass: EthereumBlockchainAdapter
    });

    container.register<IIPFSPort>('IIPFSPort', {
        useClass: IPFSAdapter
    });

    // Registrar Use Cases (Application)
    container.register<IRegisterFineUseCase>('IRegisterFineUseCase', {
        useClass: RegisterFineUseCase
    });

    container.register<IGetFineUseCase>('IGetFineUseCase', {
        useClass: GetFineUseCase
    });

    container.register<IUpdateFineStatusUseCase>('IUpdateFineStatusUseCase', {
        useClass: UpdateFineStatusUseCase
    });

    container.register<IGetAllFinesUseCase>('IGetAllFinesUseCase', {
        useClass: GetAllFinesUseCase
    });

    container.register<IGetFinesByPlateUseCase>('IGetFinesByPlateUseCase', {
        useClass: GetFinesByPlateUseCase
    });

    container.register<IVerifyIntegrityUseCase>('IVerifyIntegrityUseCase', {
        useClass: VerifyIntegrityUseCase
    });

    container.register<IGetFineEvidenceUseCase>('IGetFineEvidenceUseCase', {
        useClass: GetFineEvidenceUseCase
    });

    console.log('[DI] Fines context dependencies configured successfully');
}
