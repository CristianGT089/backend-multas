import { ethers } from 'ethers';
import FineManagementArtifact from '../../../../fotomultas/artifacts/contracts/FineManagement.sol/FineManagement.json' assert { type: "json" };
import { IBlockchainRepository, IFineDetails } from './interfaces/blockchain.repository.interface.js';
import dotenv from 'dotenv';

dotenv.config();

// Definir el enum FineState para TypeScript
export enum FineState {
    PENDING = 0,
    PAID = 1,
    APPEALED = 2,
    RESOLVED_APPEAL = 3,
    CANCELLED = 4
}

// Interfaz para FineStatusUpdate
export interface IFineStatusUpdate {
    lastUpdatedTimestamp: string;
    oldState: number;
    newState: number;
    reason: string;
    updatedBy: string;
}

export class BlockchainRepository implements IBlockchainRepository {
    private static instance: BlockchainRepository;
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;
    private isInitialized: boolean = false;

    private constructor() {
        const RPC_URL = process.env.NODE_RPC_URL || 'http://127.0.0.1:8545';
        const OWNER_KEY = process.env.OWNER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

        if (!CONTRACT_ADDRESS) {
            throw new Error("Missing environment variables for blockchain service.");
        }

        console.log("Configuración del servicio blockchain:", {
            rpcUrl: RPC_URL,
            contractAddress: CONTRACT_ADDRESS,
            ownerAddress: new ethers.Wallet(OWNER_KEY).address
        });

        this.provider = new ethers.JsonRpcProvider(RPC_URL);
        this.wallet = new ethers.Wallet(OWNER_KEY, this.provider);
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, FineManagementArtifact.abi, this.wallet);
    }

    public static getInstance(): BlockchainRepository {
        if (!BlockchainRepository.instance) {
            BlockchainRepository.instance = new BlockchainRepository();
        }
        return BlockchainRepository.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;
        await this.verifyContract();
        this.isInitialized = true;
    }

    public async verifyContract(): Promise<void> {
        try {
            const code = await this.provider.getCode(this.contract.target);
            if (code === '0x') {
                throw new Error(`No hay contrato desplegado en la dirección ${this.contract.target}`);
            }

            const owner = await this.contract.owner();
            console.log("Verificación del contrato exitosa:", {
                address: this.contract.target,
                owner: owner,
                code: code.slice(0, 66) + '...'
            });
        } catch (error: any) {
            console.error("Error al verificar el contrato:", error);
            throw new Error(`Error al verificar el contrato: ${error.message}`);
        }
    }

    public async registerFine(
        plateNumber: string,
        evidenceCID: string,
        location: string,
        infractionType: string,
        cost: number,
        ownerIdentifier: string,
        externalSystemId: string = ""
    ): Promise<{ fineId: string; transactionHash: string }> {
        try {
            await this.verifyContract();

            console.log("Iniciando registro de multa:", {
                plateNumber,
                evidenceCID,
                location,
                infractionType,
                cost,
                ownerIdentifier,
                externalSystemId
            });

            const tx = await this.contract.registerFine(
                plateNumber,
                evidenceCID,
                location,
                infractionType,
                ethers.parseUnits(cost.toString(), 0),
                ownerIdentifier,
                externalSystemId
            );
            
            console.log("Transacción enviada:", {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                data: tx.data
            });

            const receipt = await tx.wait();
            
            if (receipt.logs.length === 0) {
                const fineCount = await this.contract.getAllFineCount();
                const fineId = fineCount.toString();
                
                return {
                    fineId,
                    transactionHash: receipt.hash
                };
            }

            const event = receipt.logs.find((log: any) => {
                try {
                    const parsedLog = this.contract.interface.parseLog({
                        topics: log.topics,
                        data: log.data
                    });
                    return parsedLog?.name === 'FineRegistered';
                } catch (error) {
                    return false;
                }
            });

            if (!event) {
                throw new Error('No se pudo encontrar el evento FineRegistered en la transacción');
            }

            const parsedLog = this.contract.interface.parseLog({
                topics: event.topics,
                data: event.data
            });

            if (!parsedLog) {
                throw new Error('Error al parsear el log del evento FineRegistered');
            }

            const fineId = parsedLog.args[0].toString();

            return {
                fineId,
                transactionHash: receipt.hash
            };
        } catch (error: any) {
            console.error("Error al registrar multa en la blockchain:", error);
            throw new Error(`Error al registrar multa en la blockchain: ${error.message}`);
        }
    }

    public async updateFineStatus(
        fineId: number,
        newState: number,
        reason: string
    ): Promise<{ transactionHash: string }> {
        try {
            const tx = await this.contract.updateFineStatus(fineId, newState, reason);
            const receipt = await tx.wait();
            return { transactionHash: receipt.hash };
        } catch (error) {
            console.error("Error updating fine status on chain:", error);
            throw new Error('Failed to update fine status on blockchain');
        }
    }

    public async getFineDetails(fineId: number): Promise<IFineDetails> {
        try {
            console.log("Obteniendo detalles de la multa:", { fineId, type: typeof fineId });

            // Validar que el ID sea un número válido
            if (isNaN(fineId) || fineId <= 0) {
                throw new Error(`Invalid fine ID: ${fineId}`);
            }

            // Verificar que el ID no sea mayor que el total de multas
            const totalFines = await this.contract.getAllFineCount();
            console.log("Total de multas en el sistema:", totalFines.toString());
            
            if (fineId > Number(totalFines)) {
                throw new Error(`Fine ID ${fineId} does not exist. Total fines: ${totalFines}`);
            }

            // Convertir el ID a BigInt para asegurar compatibilidad con el contrato
            const bigIntFineId = BigInt(fineId);
            console.log("Llamando al contrato con ID:", bigIntFineId.toString());

            const fine = await this.contract.getFineDetails(bigIntFineId);
            console.log("Respuesta del contrato:", fine);

            if (!fine || !fine.id) {
                throw new Error(`Fine with ID ${fineId} not found`);
            }

            return {
                id: fine.id.toString(),
                plateNumber: fine.plateNumber,
                evidenceCID: fine.evidenceCID,
                location: fine.location,
                timestamp: fine.timestamp.toString(),
                infractionType: fine.infractionType,
                cost: fine.cost.toString(),
                ownerIdentifier: fine.ownerIdentifier,
                currentState: fine.currentState.toString(),
                registeredBy: fine.registeredBy,
                externalSystemId: fine.externalSystemId,
                hashImageIPFS: fine.evidenceCID
            };
        } catch (error: any) {
            console.error("Error fetching fine details from blockchain:", error);
            throw new Error(`Failed to fetch fine details from blockchain: ${error.message}`);
        }
    }

    public async getFinesDetails(page: number = 1, pageSize: number = 10): Promise<IFineDetails[]> {
        try {
            // Validar parámetros de paginación
            if (page < 1 || pageSize < 1) {
                throw new Error('Invalid pagination parameters');
            }

            // Obtener el total de multas primero
            const totalFines = await this.contract.getAllFineCount();
            console.log("Total de multas en el sistema:", totalFines.toString());
            
            // Si no hay multas, retornar array vacío
            if (totalFines.toString() === '0') {
                return [];
            }

            // Ajustar el tamaño de página si es necesario
            const adjustedPageSize = Math.min(pageSize, Number(totalFines));
            console.log("Tamaño de página ajustado:", adjustedPageSize);

            // Obtener las multas paginadas
            const fines = await this.contract.getPaginatedFines(page, adjustedPageSize);
            console.log("Multas obtenidas:", fines.length);
            
            // Mapear los resultados, filtrando cualquier resultado nulo o indefinido
            return fines
                .filter((fine: any) => fine && fine.id) // Asegurarse de que la multa es válida
                .map((fine: any) => ({
                    id: fine.id.toString(),
                    plateNumber: fine.plateNumber,
                    evidenceCID: fine.evidenceCID,
                    location: fine.location,
                    timestamp: fine.timestamp.toString(),
                    infractionType: fine.infractionType,
                    cost: fine.cost.toString(),
                    ownerIdentifier: fine.ownerIdentifier,
                    currentState: fine.currentState.toString(),
                    registeredBy: fine.registeredBy,
                    externalSystemId: fine.externalSystemId,
                    hashImageIPFS: fine.evidenceCID
                }));
        } catch (error) {
            console.error("Error fetching fines details from blockchain:", error);
            throw new Error('Failed to fetch fines details from blockchain');
        }
    }

    public async getFinesByPlate(plateNumber: string): Promise<string[]> {
        try {
            const fineIds = await this.contract.getFinesByPlate(plateNumber);
            console.log("Fines encontradas por placa:", fineIds.map((id: bigint) => id.toString()));
            return fineIds.map((id: bigint) => id.toString());
        } catch (error) {
            console.error("Error fetching fines by plate:", error);
            throw new Error('Failed to fetch fines by plate from blockchain');
        }
    }

    public async linkFineToSIMIT(fineId: number, simitId: string): Promise<string> {
        try {
            const tx = await this.contract.updateFineStatus(
                fineId,
                0,
                `Linked to SIMIT: ${simitId}`
            );
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error("Error linking fine to SIMIT:", error);
            throw new Error('Failed to link fine to SIMIT');
        }
    }

    public async verifyBlockchainIntegrity(fineId: number): Promise<{ 
        isIntegrityValid: boolean; 
        details: {
            registrationBlock: number;
            registrationTimestamp: number;
            statusHistoryLength: number;
            lastStatusUpdate: number;
            verificationDetails: string[];
        }
    }> {
        try {
            // 1. Obtener detalles de la multa
            const fine = await this.contract.getFineDetails(fineId);
            if (!fine || fine.id.toString() === '0') {
                throw new Error('Multa no encontrada');
            }

            // 2. Obtener detalles de registro
            const registrationDetails = await this.contract.getFineRegistrationDetails(fineId);
            
            // 3. Obtener el historial de estados (primera página)
            const [statusHistory, totalUpdates] = await this.contract.getFineStatusHistory(fineId, 1, 1);
            
            // 4. Verificar la secuencia de estados
            const verificationDetails: string[] = [];
            
            // Verificar que el estado actual coincida con el último estado del historial
            if (statusHistory.length > 0) {
                const lastStatus = statusHistory[0];
                if (lastStatus.newState !== fine.currentState) {
                    verificationDetails.push('El estado actual no coincide con el último estado del historial');
                }
            }

            // Verificar que el timestamp de registro sea válido
            if (registrationDetails.timestamp.toString() === '0') {
                verificationDetails.push('Timestamp de registro inválido');
            }

            // Verificar que el historial de estados sea consistente
            if (totalUpdates.toString() === '0' && fine.currentState !== 0) { // 0 = PENDING
                verificationDetails.push('La multa tiene un estado pero no tiene historial de estados');
            }

            // Si hay detalles de verificación, la integridad no es válida
            const isIntegrityValid = verificationDetails.length === 0;

            return {
                isIntegrityValid,
                details: {
                    registrationBlock: Number(registrationDetails.blockNumber),
                    registrationTimestamp: Number(registrationDetails.timestamp),
                    statusHistoryLength: Number(totalUpdates),
                    lastStatusUpdate: statusHistory.length > 0 ? 
                        Number(statusHistory[0].lastUpdatedTimestamp) : 0,
                    verificationDetails: isIntegrityValid ? 
                        ['Todas las verificaciones de integridad pasaron exitosamente'] : 
                        verificationDetails
                }
            };

        } catch (error: any) {
            console.error('Error al verificar la integridad de la blockchain:', error);
            return {
                isIntegrityValid: false,
                details: {
                    registrationBlock: 0,
                    registrationTimestamp: 0,
                    statusHistoryLength: 0,
                    lastStatusUpdate: 0,
                    verificationDetails: [`Error en la verificación: ${error.message}`]
                }
            };
        }
    }

    /**
     * Obtiene el historial de estados de una multa de forma paginada.
     * @param fineId ID de la multa
     * @param page Número de página (comienza en 1)
     * @param pageSize Tamaño de la página
     * @returns Objeto con el historial de estados y el total de actualizaciones
     */
    public async getFineStatusHistory(
        fineId: number,
        page: number = 1,
        pageSize: number = 10
    ): Promise<{ updates: IFineStatusUpdate[]; totalUpdates: number }> {
        try {
            console.log("Obteniendo historial de estados:", {
                fineId,
                page,
                pageSize
            });

            // Verificar que el contrato esté inicializado
            await this.verifyContract();

            // Obtener la interfaz del contrato
            const contractInterface = this.contract.interface;
            
            // Crear la llamada a la función
            const data = contractInterface.encodeFunctionData("getFineStatusHistory", [
                fineId,
                page,
                pageSize
            ]);

            // Realizar la llamada al contrato
            const result = await this.provider.call({
                to: this.contract.target,
                data: data
            });

            // Decodificar el resultado
            const decodedResult = contractInterface.decodeFunctionResult(
                "getFineStatusHistory",
                result
            );

            const [updates, totalUpdates] = decodedResult;

            console.log("Respuesta del contrato:", {
                updatesLength: updates.length,
                totalUpdates: totalUpdates.toString()
            });

            // Convertir los resultados al formato esperado
            const formattedUpdates = updates.map((update: {
                lastUpdatedTimestamp: bigint;
                oldState: bigint;
                newState: bigint;
                reason: string;
                updatedBy: string;
            }) => ({
                lastUpdatedTimestamp: update.lastUpdatedTimestamp.toString(),
                oldState: Number(update.oldState),
                newState: Number(update.newState),
                reason: update.reason,
                updatedBy: update.updatedBy
            }));

            return {
                updates: formattedUpdates,
                totalUpdates: Number(totalUpdates)
            };
        } catch (error: any) {
            console.error("Error al obtener el historial de estados:", error);
            if (error.code === 'UNSUPPORTED_OPERATION') {
                console.error("Detalles del error:", {
                    operation: error.operation,
                    info: error.info,
                    contractAddress: this.contract.target,
                    abi: this.contract.interface.format()
                });
            }
            throw new Error(`Error al obtener el historial de estados: ${error.message}`);
        }
    }

    public getContract(): ethers.Contract {
        return this.contract;
    }

    public getProvider(): ethers.JsonRpcProvider {
        return this.provider;
    }

    public getWallet(): ethers.Wallet {
        return this.wallet;
    }
} 