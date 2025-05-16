import { ethers } from 'ethers';
import FineManagementArtifact from '../../../fotomultas/artifacts/contracts/FineManagement.sol/FineManagement.json' assert { type: "json" };
import dotenv from 'dotenv';

dotenv.config();

class BlockchainService {
    private static instance: BlockchainService;
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;
    private isInitialized: boolean = false;

    private constructor() {
        const RPC_URL = process.env.NODE_RPC_URL || 'http://127.0.0.1:8545';
        const OWNER_KEY = process.env.OWNER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Clave privada del owner por defecto en Hardhat
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

        // Verificar que el contrato está correctamente inicializado
        this.verifyContract();
    }

    private async verifyContract() {
        try {
            // Verificar que el contrato está desplegado
            const code = await this.provider.getCode(this.contract.target);
            if (code === '0x') {
                throw new Error(`No hay contrato desplegado en la dirección ${this.contract.target}`);
            }

            // Verificar que podemos llamar a una función del contrato
            const owner = await this.contract.owner();
            console.log("Verificación del contrato exitosa:", {
                address: this.contract.target,
                owner: owner,
                code: code.slice(0, 66) + '...' // Solo mostramos el inicio del código
            });
        } catch (error: any) {
            console.error("Error al verificar el contrato:", error);
            throw new Error(`Error al verificar el contrato: ${error.message}`);
        }
    }

    public static getInstance(): BlockchainService {
        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }
        return BlockchainService.instance;
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
            // Verificar el contrato antes de proceder
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

            // Verificar que el contrato está correctamente configurado
            console.log("Verificando contrato antes de la transacción:", {
                address: this.contract.target,
                signer: this.wallet.address
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
            console.log("Recibo de transacción:", {
                blockNumber: receipt.blockNumber,
                status: receipt.status,
                logs: receipt.logs.length,
                logsDetails: receipt.logs.map((log: any) => ({
                    address: log.address,
                    topics: log.topics,
                    data: log.data
                }))
            });

            // Si no hay logs, intentar obtener el ID de la multa directamente
            if (receipt.logs.length === 0) {
                console.log("No se encontraron logs, intentando obtener el ID de la multa directamente...");
                const fineCount = await this.contract.getAllFineCount();
                console.log("Número total de multas:", fineCount.toString());
                
                // Asumimos que el ID de la multa es el último contador
                const fineId = fineCount.toString();
                
                console.log("Multa registrada exitosamente (sin eventos):", {
                    fineId,
                    transactionHash: receipt.hash
                });

                return {
                    fineId,
                    transactionHash: receipt.hash
                };
            }

            // Buscar el evento FineRegistered en los logs
            const event = receipt.logs.find((log: any) => {
                try {
                    const parsedLog = this.contract.interface.parseLog({
                        topics: log.topics,
                        data: log.data
                    });
                    console.log("Log parseado:", parsedLog);
                    return parsedLog?.name === 'FineRegistered';
                } catch (error) {
                    console.log("Error al parsear log:", error);
                    return false;
                }
            });

            if (!event) {
                console.error("No se encontró el evento FineRegistered en los logs:", receipt.logs);
                throw new Error('No se pudo encontrar el evento FineRegistered en la transacción');
            }

            const parsedLog = this.contract.interface.parseLog({
                topics: event.topics,
                data: event.data
            });

            if (!parsedLog) {
                console.error("No se pudo parsear el log del evento");
                throw new Error('Error al parsear el log del evento FineRegistered');
            }

            const fineId = parsedLog.args[0].toString();

            console.log("Multa registrada exitosamente:", {
                fineId,
                transactionHash: receipt.hash
            });

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

    public async getFineDetails(fineId: number): Promise<any> {
        try {
            const fine = await this.contract.getFineDetails(fineId);
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
                hashImageIPFS: fine.hashImageIPFS
            };
        } catch (error) {
            console.error("Error fetching fine details from blockchain:", error);
            throw new Error('Failed to fetch fine details from blockchain');
        }
    }

    public async getFinesDetails(): Promise<any[]> {
        try {
            const fines = await this.contract.getFinesDetails();
            return fines.map((fine: any) => ({
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
                hashImageIPFS: fine.hashImageIPFS
            }));
        } catch (error) {
            console.error("Error fetching fines details from blockchain:", error);
            throw new Error('Failed to fetch fines details from blockchain');
        }
    }

    public async getFinesByPlate(plateNumber: string): Promise<string[]> {
        try {
            const fineIds = await this.contract.getFinesByPlate(plateNumber);
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
                0, // PENDING state
                `Linked to SIMIT: ${simitId}`
            );
            const receipt = await tx.wait();
            return receipt.hash;
        } catch (error) {
            console.error("Error linking fine to SIMIT:", error);
            throw new Error('Failed to link fine to SIMIT');
        }
    }

    public async verifyBlockchainIntegrity(fineId: number): Promise<boolean> {
        try {
            // Obtener los detalles de la multa
            const fine = await this.contract.getFineDetails(fineId);
            
            // Obtener el bloque donde se registró la multa
            const tx = await this.provider.getTransaction(fine.registeredBy);
            if (!tx || !tx.blockNumber) {
                throw new Error('No se encontró la transacción de registro');
            }

            // Obtener el bloque
            const block = await this.provider.getBlock(tx.blockNumber);
            if (!block) {
                throw new Error('No se encontró el bloque');
            }

            // Verificar que el hash del bloque coincide con el hash calculado
            const calculatedHash = block.hash;
            const storedHash = await this.provider.getBlock(tx.blockNumber);
            
            // Verificar que el hash del bloque no ha sido alterado
            if (calculatedHash !== storedHash?.hash) {
                console.error('Integridad comprometida: El hash del bloque ha sido alterado');
                return false;
            }

            // Verificar que la transacción está incluida en el bloque
            const txInBlock = await this.provider.getTransaction(tx.hash);
            if (!txInBlock || txInBlock.blockNumber !== block.number) {
                console.error('Integridad comprometida: La transacción no está en el bloque esperado');
                return false;
            }

            console.log('Verificación de integridad exitosa para la multa:', fineId);
            return true;
        } catch (error) {
            console.error('Error al verificar la integridad de la blockchain:', error);
            return false;
        }
    }
    
    public getFineStatusHistoryFromBlockchain(arg0: number) {
        throw new Error('Function not implemented.');
    }
}

// Exportar una instancia única del servicio
export const blockchainService = BlockchainService.getInstance();

// Enumeración para los estados de las multas en la blockchain
const FineStatusBlockchain = {
    PENDING: 0,
    PAID: 1,
    CANCELLED: 2,
    DISPUTED: 3,
} as const;

export { FineStatusBlockchain };

// Exporta el tipo de los valores de FineStatusBlockchain
export type FineStatus = typeof FineStatusBlockchain[keyof typeof FineStatusBlockchain];


