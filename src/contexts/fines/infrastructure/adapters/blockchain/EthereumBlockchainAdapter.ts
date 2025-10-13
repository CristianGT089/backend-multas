import { injectable } from 'tsyringe';
import { Result } from '../../../../../shared/domain/value-objects/Result.js';
import type { IBlockchainPort, BlockchainTransactionResult, FineStatusHistory } from '../../../domain/ports/output/IBlockchainPort.js';
import { Fine } from '../../../domain/entities/Fine.js';
import { FineId } from '../../../domain/value-objects/FineId.js';
import { FineState } from '../../../domain/value-objects/FineState.js';
import { BlockchainRepository } from '../../../../../fine/repositories/blockchain.repository.js';
import { FineMapper } from '../../../application/mappers/FineMapper.js';

/**
 * Adapter: Implementación de IBlockchainPort para Ethereum
 * Adapta BlockchainRepository (legacy) al puerto del dominio
 */
@injectable()
export class EthereumBlockchainAdapter implements IBlockchainPort {
    private readonly repository: BlockchainRepository;

    constructor() {
        this.repository = BlockchainRepository.getInstance();
    }

    async registerFine(fine: Fine): Promise<Result<BlockchainTransactionResult & { fineId: number }>> {
        try {
            await this.repository.initialize();

            const primitives = fine.toPrimitives();

            const result = await this.repository.registerFine(
                primitives.plateNumber,
                primitives.evidenceCID,
                primitives.location,
                primitives.infractionType,
                primitives.cost,
                primitives.ownerIdentifier,
                primitives.externalSystemId || ''
            );

            return Result.ok({
                txHash: result.transactionHash,
                timestamp: new Date(),
                fineId: parseInt(result.fineId, 10)
            });
        } catch (error: any) {
            return Result.fail(`Failed to register fine on blockchain: ${error.message}`);
        }
    }

    async getFineById(id: FineId): Promise<Result<Fine>> {
        try {
            const details = await this.repository.getFineDetails(id.value);

            const fine = FineMapper.toDomain({
                id: parseInt(details.id, 10),
                plateNumber: details.plateNumber,
                evidenceCID: details.evidenceCID,
                location: details.location,
                timestamp: new Date(parseInt(details.timestamp, 10) * 1000),
                infractionType: details.infractionType,
                cost: details.cost,
                ownerIdentifier: details.ownerIdentifier,
                currentState: parseInt(details.currentState, 10),
                registeredBy: details.registeredBy,
                externalSystemId: details.externalSystemId
            });

            return Result.ok(fine);
        } catch (error: any) {
            return Result.fail(`Failed to get fine from blockchain: ${error.message}`);
        }
    }

    async updateFineStatus(
        id: FineId,
        newState: FineState,
        reason: string,
        updatedBy: string
    ): Promise<Result<BlockchainTransactionResult>> {
        try {
            const result = await this.repository.updateFineStatus(
                id.value,
                newState.value,
                reason
            );

            return Result.ok({
                txHash: result.transactionHash,
                timestamp: new Date()
            });
        } catch (error: any) {
            return Result.fail(`Failed to update fine status: ${error.message}`);
        }
    }

    async getFineStatusHistory(id: FineId): Promise<Result<FineStatusHistory[]>> {
        try {
            const history = await this.repository.getFineStatusHistory(id.value, 1, 100);

            const mappedHistory: FineStatusHistory[] = history.updates.map(update => ({
                fineId: id.value,
                oldState: update.oldState,
                newState: update.newState,
                reason: update.reason,
                updatedBy: update.updatedBy,
                timestamp: new Date(parseInt(update.lastUpdatedTimestamp, 10) * 1000)
            }));

            return Result.ok(mappedHistory);
        } catch (error: any) {
            return Result.fail(`Failed to get fine status history: ${error.message}`);
        }
    }

    async verifyIntegrity(id: FineId): Promise<Result<{
        isValid: boolean;
        registrationBlock: number;
        registrationTimestamp: Date;
        statusHistoryLength: number;
        dataHash: string;
    }>> {
        try {
            const result = await this.repository.verifyBlockchainIntegrity(id.value);

            return Result.ok({
                isValid: result.isIntegrityValid,
                registrationBlock: result.details.registrationBlock,
                registrationTimestamp: new Date(result.details.registrationTimestamp * 1000),
                statusHistoryLength: result.details.statusHistoryLength,
                dataHash: '' // TODO: Implement data hash calculation
            });
        } catch (error: any) {
            return Result.fail(`Failed to verify integrity: ${error.message}`);
        }
    }

    async getAllFines(page: number, pageSize: number): Promise<Result<Fine[]>> {
        try {
            const details = await this.repository.getFinesDetails(page, pageSize);

            const fines = details.map(d => FineMapper.toDomain({
                id: parseInt(d.id, 10),
                plateNumber: d.plateNumber,
                evidenceCID: d.evidenceCID,
                location: d.location,
                timestamp: new Date(parseInt(d.timestamp, 10) * 1000),
                infractionType: d.infractionType,
                cost: d.cost,
                ownerIdentifier: d.ownerIdentifier,
                currentState: parseInt(d.currentState, 10),
                registeredBy: d.registeredBy,
                externalSystemId: d.externalSystemId
            }));

            return Result.ok(fines);
        } catch (error: any) {
            return Result.fail(`Failed to get all fines: ${error.message}`);
        }
    }

    async getFinesByPlate(plateNumber: string): Promise<Result<Fine[]>> {
        try {
            const fineIds = await this.repository.getFinesByPlate(plateNumber);

            if (fineIds.length === 0) {
                return Result.ok([]);
            }

            const finesPromises = fineIds.map(async (id) => {
                const fineId = FineId.create(parseInt(id, 10));
                return this.getFineById(fineId);
            });

            const results = await Promise.all(finesPromises);

            // Verificar si alguna falló
            const errors = results.filter(r => !r.isSuccess);
            if (errors.length > 0) {
                return Result.fail(`Failed to fetch some fines: ${errors.map(e => e.error).join(', ')}`);
            }

            const fines = results.map(r => r.value!);
            return Result.ok(fines);
        } catch (error: any) {
            return Result.fail(`Failed to get fines by plate: ${error.message}`);
        }
    }

    async getTotalFines(): Promise<Result<number>> {
        try {
            // Obtener el contrato y llamar al método para obtener el total
            const contract = this.repository.getContract();
            const total = await contract.getAllFineCount();
            return Result.ok(Number(total));
        } catch (error: any) {
            return Result.fail(`Failed to get total fines: ${error.message}`);
        }
    }
}
