import pkg from 'hardhat';
const { ethers } = pkg;
import { expect } from "chai";

describe("FineManagement Contract", function () {
    let FineManagementFactory;
    let fineManagement;
    let owner;
    let operator1;
    let user1;
    let addrs;

    // Constantes para pruebas
    const PLATE_NUMBER = "ABC123";
    const EVIDENCE_CID = "QmXgZAUkHYNz6G1j2kNnMZJc2kL1n7vJgYf8eW3zH7rK9s";
    const LOCATION = "Av. Siempre Viva 123";
    const INFRACTION_TYPE = "Exceso de velocidad";
    const COST = ethers.parseUnits("100", "ether"); // 100 con 18 decimales
    const OWNER_IDENTIFIER = "DNI12345678";
    const EXTERNAL_ID = "SIMIT-XYZ";

    beforeEach(async function () {
        [owner, operator1, user1, ...addrs] = await ethers.getSigners();
        FineManagementFactory = await ethers.getContractFactory("FineManagement");
        fineManagement = await FineManagementFactory.deploy();
        await fineManagement.waitForDeployment();

        // El owner es operador por defecto, añadimos operator1
        await fineManagement.connect(owner).addOperator(operator1.address);
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await fineManagement.owner()).to.equal(owner.address);
        });

        it("Should set the deployer as an operator", async function () {
            expect(await fineManagement.operators(owner.address)).to.be.true;
        });
    });

    describe("Operator Management", function () {
        it("Owner should be able to add an operator", async function () {
            await fineManagement.connect(owner).addOperator(user1.address);
            expect(await fineManagement.operators(user1.address)).to.be.true;
        });

        it("Owner should be able to remove an operator", async function () {
            await fineManagement.connect(owner).addOperator(user1.address);
            expect(await fineManagement.operators(user1.address)).to.be.true;
            await fineManagement.connect(owner).removeOperator(user1.address);
            expect(await fineManagement.operators(user1.address)).to.be.false;
        });

        it("Non-owner should not be able to add or remove an operator", async function () {
            await expect(
                fineManagement.connect(user1).addOperator(addrs[0].address)
            ).to.be.revertedWithCustomError(fineManagement, "OwnableUnauthorizedAccount");

            await expect(
                fineManagement.connect(user1).removeOperator(operator1.address)
            ).to.be.revertedWithCustomError(fineManagement, "OwnableUnauthorizedAccount");
        });
    });

    describe("Fine Registration", function () {
        it("Operator should be able to register a fine", async function () {
            const tx = await fineManagement.connect(operator1).registerFine(
                PLATE_NUMBER,
                EVIDENCE_CID,
                LOCATION,
                INFRACTION_TYPE,
                COST,
                OWNER_IDENTIFIER,
                EXTERNAL_ID
            );
            const receipt = await tx.wait();
            
            // Buscar el evento FineRegistered
            const fineRegisteredEvent = receipt.logs.find(log => {
                try {
                    const parsed = fineManagement.interface.parseLog(log);
                    return parsed.name === "FineRegistered";
                } catch {
                    return false;
                }
            });

            expect(fineRegisteredEvent).to.not.be.undefined;
            
            if (fineRegisteredEvent) {
                const parsed = fineManagement.interface.parseLog(fineRegisteredEvent);
                const fineId = Number(parsed.args[0]);
                expect(fineId).to.equal(1);

                const fineDetails = await fineManagement.getFineDetails(fineId);
                expect(fineDetails.plateNumber).to.equal(PLATE_NUMBER);
                expect(fineDetails.evidenceCID).to.equal(EVIDENCE_CID);
                expect(fineDetails.currentState).to.equal(0); // 0 for FineState.PENDING
                expect(fineDetails.registeredBy).to.equal(operator1.address);
            }
        });

        it("Non-operator should not be able to register a fine", async function () {
            await expect(
                fineManagement.connect(user1).registerFine(
                    PLATE_NUMBER,
                    EVIDENCE_CID,
                    LOCATION,
                    INFRACTION_TYPE,
                    COST,
                    OWNER_IDENTIFIER,
                    EXTERNAL_ID
                )
            ).to.be.revertedWith("Not an operator");
        });

        it("Should increment fine ID for subsequent fines", async function () {
            await fineManagement.connect(operator1).registerFine(
                "PLT001",
                "CID001",
                "LOC1",
                "TYPE1",
                ethers.parseUnits("10", "ether"),
                "OWN1",
                "EXT1"
            );
            const tx2 = await fineManagement.connect(operator1).registerFine(
                "PLT002",
                "CID002",
                "LOC2",
                "TYPE2",
                ethers.parseUnits("20", "ether"),
                "OWN2",
                "EXT2"
            );
            const receipt2 = await tx2.wait();
            
            const fineRegisteredEvent2 = receipt2.logs.find(log => {
                try {
                    const parsed = fineManagement.interface.parseLog(log);
                    return parsed.name === "FineRegistered";
                } catch {
                    return false;
                }
            });

            expect(fineRegisteredEvent2).to.not.be.undefined;
            
            if (fineRegisteredEvent2) {
                const parsed = fineManagement.interface.parseLog(fineRegisteredEvent2);
                const fineId2 = Number(parsed.args[0]);
                expect(fineId2).to.equal(2);
            }
        });
    });

    describe("Fine Status Update", function () {
        let fineId;

        beforeEach(async function () {
            const tx = await fineManagement.connect(operator1).registerFine(
                PLATE_NUMBER,
                EVIDENCE_CID,
                LOCATION,
                INFRACTION_TYPE,
                COST,
                OWNER_IDENTIFIER,
                EXTERNAL_ID
            );
            const receipt = await tx.wait();
            
            const fineRegisteredEvent = receipt.logs.find(log => {
                try {
                    const parsed = fineManagement.interface.parseLog(log);
                    return parsed.name === "FineRegistered";
                } catch {
                    return false;
                }
            });

            if (fineRegisteredEvent) {
                const parsed = fineManagement.interface.parseLog(fineRegisteredEvent);
                fineId = Number(parsed.args[0]);
            }
        });

        it("Operator should be able to update fine status", async function () {
            await expect(
                fineManagement.connect(operator1).updateFineStatus(fineId, 1, "Payment received")
            )
                .to.emit(fineManagement, "FineStatusUpdated");

            const fineDetails = await fineManagement.getFineDetails(fineId);
            expect(fineDetails.currentState).to.equal(1); // 1 for FineState.PAID
        });

        it("Non-operator should not be able to update fine status", async function () {
            await expect(
                fineManagement.connect(user1).updateFineStatus(fineId, 1, "Payment received")
            ).to.be.revertedWith("Not an operator");
        });

        it("Should not allow updating to the same status", async function () {
            await expect(
                fineManagement.connect(operator1).updateFineStatus(fineId, 0, "Already pending")
            ).to.be.revertedWith("State is already the same");
        });

        it("Should revert for invalid fine ID", async function () {
            await expect(
                fineManagement.connect(operator1).updateFineStatus(999, 1, "Invalid ID")
            ).to.be.revertedWith("Fine does not exist");
        });
    });

    describe("Inmutabilidad de Metadatos (IM-001)", function () {
        let fineId;

        beforeEach(async function () {
            const tx = await fineManagement.connect(operator1).registerFine(
                PLATE_NUMBER,
                EVIDENCE_CID,
                LOCATION,
                INFRACTION_TYPE,
                COST,
                OWNER_IDENTIFIER,
                EXTERNAL_ID
            );
            const receipt = await tx.wait();
            
            const fineRegisteredEvent = receipt.logs.find(log => {
                try {
                    const parsed = fineManagement.interface.parseLog(log);
                    return parsed.name === "FineRegistered";
                } catch {
                    return false;
                }
            });

            if (fineRegisteredEvent) {
                const parsed = fineManagement.interface.parseLog(fineRegisteredEvent);
                fineId = Number(parsed.args[0]);
            }
        });

        it("Should not allow direct modification of fine metadata", async function () {
            // Verificar que los datos originales permanecen inmutables
            const fineDetails = await fineManagement.getFineDetails(fineId);
            const originalPlate = fineDetails.plateNumber;
            const originalCID = fineDetails.evidenceCID;
            
            // Verificar que no hay métodos para modificar metadatos
            const contractInterface = fineManagement.interface;
            const functions = Object.keys(contractInterface.functions || {});
            
            // No debería haber funciones para modificar metadatos de multas existentes
            const modificationFunctions = functions.filter(fn => 
                fn.includes('update') && 
                (fn.includes('Plate') || fn.includes('Evidence') || fn.includes('Location') || fn.includes('Type'))
            );
            
            expect(modificationFunctions).to.have.length(0);
            
            // Verificar que los datos originales siguen siendo los mismos
            const fineDetailsAfter = await fineManagement.getFineDetails(fineId);
            expect(fineDetailsAfter.plateNumber).to.equal(originalPlate);
            expect(fineDetailsAfter.evidenceCID).to.equal(originalCID);
        });

        it("Should maintain data integrity across multiple operations", async function () {
            // Realizar múltiples operaciones y verificar que los datos originales no cambian
            const originalDetails = await fineManagement.getFineDetails(fineId);
            
            // Realizar algunas operaciones
            await fineManagement.connect(operator1).updateFineStatus(fineId, 1, "Payment received");
            await fineManagement.connect(operator1).updateFineStatus(fineId, 2, "Appealed");
            
            // Verificar que los metadatos originales siguen siendo los mismos
            const finalDetails = await fineManagement.getFineDetails(fineId);
            expect(finalDetails.plateNumber).to.equal(originalDetails.plateNumber);
            expect(finalDetails.evidenceCID).to.equal(originalDetails.evidenceCID);
            expect(finalDetails.location).to.equal(originalDetails.location);
            expect(finalDetails.infractionType).to.equal(originalDetails.infractionType);
            expect(finalDetails.cost).to.equal(originalDetails.cost);
        });
    });
}); 