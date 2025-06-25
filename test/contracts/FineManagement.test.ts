import { ethers } from "hardhat";
import { expect } from "chai";
import { FineManagement, FineManagement__factory } from "../typechain-types"; // Generado por TypeChain
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("FineManagement Contract", function () {
    let FineManagementFactory: FineManagement__factory;
    let fineManagement: FineManagement;
    let owner: SignerWithAddress;
    let operator1: SignerWithAddress;
    let user1: SignerWithAddress;
    let addrs: SignerWithAddress[];

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
        fineManagement = (await FineManagementFactory.deploy()) as FineManagement;
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
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                fineManagement.connect(user1).removeOperator(operator1.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
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
            const fineRegisteredEvent = receipt.events?.find(e => e.event === "FineRegistered");

            expect(fineRegisteredEvent).to.not.be.undefined;
            const fineId = fineRegisteredEvent?.args?.fineId;
            expect(fineId).to.equal(1);

            const fineDetails = await fineManagement.getFineDetails(fineId);
            expect(fineDetails.plateNumber).to.equal(PLATE_NUMBER);
            expect(fineDetails.evidenceCID).to.equal(EVIDENCE_CID);
            expect(fineDetails.currentState).to.equal(0); // 0 for FineState.PENDING
            expect(fineDetails.registeredBy).to.equal(operator1.address);
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
            const fineId2 = receipt2.events?.find(e => e.event === "FineRegistered")?.args?.fineId;
            expect(fineId2).to.equal(2);
        });
    });

    describe("Fine Status Update", function () {
        let fineId: number;

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
            fineId = receipt.events?.find(e => e.event === "FineRegistered")?.args?.fineId.toNumber();
        });

        it("Operator should be able to update fine status", async function () {
            await expect(
                fineManagement.connect(operator1).updateFineStatus(fineId, 1, "Payment received")
            )
                .to.emit(fineManagement, "FineStatusUpdated")
                .withArgs(fineId, 0, 1, "Payment received");

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
            ).to.be.revertedWith("Fine: Status is already the same");
        });

        it("Should revert for invalid fine ID", async function () {
            await expect(
                fineManagement.connect(operator1).updateFineStatus(999, 1, "Invalid ID")
            ).to.be.revertedWith("Fine: Invalid ID");
        });
    });
});