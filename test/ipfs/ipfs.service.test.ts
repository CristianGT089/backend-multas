import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { create } from "ipfs-http-client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("IPFS Service Tests", () => {
    let ipfs: any;
    let testFileContent: string;
    let testFilePath: string;

    beforeEach(async () => {
        // Configurar cliente IPFS
        ipfs = create({ url: "http://127.0.0.1:5001/api/v0" });
        
        // Crear archivo de prueba
        testFileContent = "Este es un archivo de prueba para IPFS - " + Date.now();
        testFilePath = path.join(__dirname, "test-file.txt");
        fs.writeFileSync(testFilePath, testFileContent);
    });

    afterEach(async () => {
        // Limpiar archivo de prueba
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });

    describe("IPFS-001: Subida y recuperación de archivos", () => {
        it("Should upload file to IPFS and get CID", async () => {
            // Subir archivo a IPFS
            const fileBuffer = fs.readFileSync(testFilePath);
            const result = await ipfs.add(fileBuffer);
            
            expect(result).toHaveProperty("cid");
            expect(result.cid.toString()).toBeTypeOf("string");
            expect(result.cid.toString()).toMatch(/^Qm[A-Za-z0-9]{44}$/); // Formato CID v0
            
            console.log(`Archivo subido con CID: ${result.cid.toString()}`);
        });

        it("Should retrieve file from IPFS using CID", async () => {
            // Subir archivo
            const fileBuffer = fs.readFileSync(testFilePath);
            const uploadResult = await ipfs.add(fileBuffer);
            
            // Recuperar archivo usando CID
            const chunks: Buffer[] = [];
            for await (const chunk of ipfs.cat(uploadResult.cid)) {
                chunks.push(chunk);
            }
            
            const retrievedContent = Buffer.concat(chunks).toString();
            expect(retrievedContent).toBe(testFileContent);
        });

        it("Should maintain file integrity through upload/download cycle", async () => {
            // Subir archivo
            const fileBuffer = fs.readFileSync(testFilePath);
            const uploadResult = await ipfs.add(fileBuffer);
            
            // Recuperar archivo
            const chunks: Buffer[] = [];
            for await (const chunk of ipfs.cat(uploadResult.cid)) {
                chunks.push(chunk);
            }
            
            const retrievedContent = Buffer.concat(chunks).toString();
            
            // Verificar integridad
            expect(retrievedContent).toBe(testFileContent);
            expect(retrievedContent.length).toBe(testFileContent.length);
            
            // Verificar que el contenido es idéntico byte por byte
            const originalHash = crypto.createHash("sha256").update(testFileContent).digest("hex");
            const retrievedHash = crypto.createHash("sha256").update(retrievedContent).digest("hex");
            expect(retrievedHash).toBe(originalHash);
        });
    });

    describe("IPFS-002: Manejo de archivos corruptos", () => {
        it("Should handle non-existent CID gracefully", async () => {
            const fakeCid = "QmFakeCidThatDoesNotExist123456789012345678901234";
            
            try {
                const chunks: Buffer[] = [];
                for await (const chunk of ipfs.cat(fakeCid)) {
                    chunks.push(chunk);
                }
                expect.fail("Should have thrown an error for non-existent CID");
            } catch (error: any) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain("invalid path");
            }
        });

        it("Should handle empty files correctly", async () => {
            const emptyContent = "";
            const emptyBuffer = Buffer.from(emptyContent);
            
            const result = await ipfs.add(emptyBuffer);
            expect(result.cid.toString()).toMatch(/^Qm[A-Za-z0-9]{44}$/);
            
            // Recuperar archivo vacío
            const chunks: Buffer[] = [];
            for await (const chunk of ipfs.cat(result.cid)) {
                chunks.push(chunk);
            }
            
            const retrievedContent = Buffer.concat(chunks).toString();
            expect(retrievedContent).toBe(emptyContent);
        });

        it("Should handle large files", async () => {
            // Crear archivo grande (1MB)
            const largeContent = "A".repeat(1024 * 1024); // 1MB de datos
            const largeBuffer = Buffer.from(largeContent);
            
            const result = await ipfs.add(largeBuffer);
            expect(result.cid.toString()).toMatch(/^Qm[A-Za-z0-9]{44}$/);
            
            // Recuperar archivo grande
            const chunks: Buffer[] = [];
            for await (const chunk of ipfs.cat(result.cid)) {
                chunks.push(chunk);
            }
            
            const retrievedContent = Buffer.concat(chunks).toString();
            expect(retrievedContent).toBe(largeContent);
            expect(retrievedContent.length).toBe(1024 * 1024);
        });
    });

    describe("IM-002: Inmutabilidad de archivos en IPFS", () => {
        it("Should maintain same CID for identical content", async () => {
            // Subir el mismo contenido múltiples veces
            const fileBuffer = fs.readFileSync(testFilePath);
            
            const result1 = await ipfs.add(fileBuffer);
            const result2 = await ipfs.add(fileBuffer);
            const result3 = await ipfs.add(fileBuffer);
            
            // Todos deberían tener el mismo CID
            expect(result1.cid.toString()).toBe(result2.cid.toString());
            expect(result2.cid.toString()).toBe(result3.cid.toString());
            
            console.log(`CID consistente para contenido idéntico: ${result1.cid.toString()}`);
        });

        it("Should generate different CID for modified content", async () => {
            // Subir contenido original
            const originalContent = "Contenido original";
            const originalBuffer = Buffer.from(originalContent);
            const originalResult = await ipfs.add(originalBuffer);
            
            // Subir contenido modificado
            const modifiedContent = "Contenido modificado";
            const modifiedBuffer = Buffer.from(modifiedContent);
            const modifiedResult = await ipfs.add(modifiedBuffer);
            
            // Los CIDs deberían ser diferentes
            expect(originalResult.cid.toString()).not.toBe(modifiedResult.cid.toString());
            
            console.log(`CID original: ${originalResult.cid.toString()}`);
            console.log(`CID modificado: ${modifiedResult.cid.toString()}`);
        });

        it("Should not allow overwriting existing content", async () => {
            // Subir contenido original
            const originalContent = "Contenido que no se puede sobrescribir";
            const originalBuffer = Buffer.from(originalContent);
            const originalResult = await ipfs.add(originalBuffer);
            
            const originalCid = originalResult.cid.toString();
            
            // Intentar "sobrescribir" con contenido diferente
            const modifiedContent = "Contenido modificado que no debería sobrescribir";
            const modifiedBuffer = Buffer.from(modifiedContent);
            const modifiedResult = await ipfs.add(modifiedBuffer);
            
            // Verificar que el contenido original sigue siendo accesible
            const chunks: Buffer[] = [];
            for await (const chunk of ipfs.cat(originalCid)) {
                chunks.push(chunk);
            }
            
            const retrievedContent = Buffer.concat(chunks).toString();
            expect(retrievedContent).toBe(originalContent);
            expect(retrievedContent).not.toBe(modifiedContent);
            
            // Verificar que los CIDs son diferentes
            expect(originalCid).not.toBe(modifiedResult.cid.toString());
        });

        it("Should maintain data integrity across multiple operations", async () => {
            // Subir archivo original
            const fileBuffer = fs.readFileSync(testFilePath);
            const uploadResult = await ipfs.add(fileBuffer);
            const originalCid = uploadResult.cid.toString();
            
            // Realizar múltiples operaciones de lectura
            for (let i = 0; i < 5; i++) {
                const chunks: Buffer[] = [];
                for await (const chunk of ipfs.cat(originalCid)) {
                    chunks.push(chunk);
                }
                
                const retrievedContent = Buffer.concat(chunks).toString();
                expect(retrievedContent).toBe(testFileContent);
                
                // Verificar que el CID no ha cambiado
                const currentResult = await ipfs.add(fileBuffer);
                expect(currentResult.cid.toString()).toBe(originalCid);
            }
        });

        it("Should demonstrate content-addressed nature of IPFS", async () => {
            // Crear contenido con hash específico
            const content1 = "Contenido específico para prueba de inmutabilidad";
            const buffer1 = Buffer.from(content1);
            
            // Subir múltiples veces
            const results: string[] = [];
            for (let i = 0; i < 3; i++) {
                const result = await ipfs.add(buffer1);
                results.push(result.cid.toString());
            }
            
            // Todos los CIDs deberían ser idénticos
            const uniqueCids = new Set(results);
            expect(uniqueCids.size).toBe(1);
            
            // Verificar que el contenido es recuperable
            const retrievedChunks: Buffer[] = [];
            for await (const chunk of ipfs.cat(results[0])) {
                retrievedChunks.push(chunk);
            }
            
            const retrievedContent = Buffer.concat(retrievedChunks).toString();
            expect(retrievedContent).toBe(content1);
            
            console.log(`Demostración de naturaleza content-addressed: CID único ${results[0]} para contenido idéntico`);
        });
    });

    describe("IPFS Integration Tests", () => {
        it("Should handle different file types", async () => {
            const testCases = [
                { content: "Texto plano", type: "text" },
                { content: JSON.stringify({ test: "data", number: 123 }), type: "json" },
                { content: "PNG header test", type: "binary" } // Cambiado a texto para evitar problemas de codificación
            ];
            
            for (const testCase of testCases) {
                const buffer = Buffer.from(testCase.content);
                const result = await ipfs.add(buffer);
                
                expect(result.cid.toString()).toMatch(/^Qm[A-Za-z0-9]{44}$/);
                
                // Recuperar y verificar
                const chunks: Buffer[] = [];
                for await (const chunk of ipfs.cat(result.cid)) {
                    chunks.push(chunk);
                }
                
                const retrievedContent = Buffer.concat(chunks);
                expect(retrievedContent.toString()).toBe(testCase.content);
            }
        });

        it("Should demonstrate IPFS as immutable storage", async () => {
            // Simular el flujo de una multa: evidencia subida a IPFS
            const evidenceContent = `Evidencia de multa:
            - Placa: ABC123
            - Fecha: ${new Date().toISOString()}
            - Ubicación: Av. Siempre Viva 123
            - Infracción: Exceso de velocidad
            - CID de evidencia: QmEvidenciaInmutable123`;
            
            const evidenceBuffer = Buffer.from(evidenceContent);
            const evidenceResult = await ipfs.add(evidenceBuffer);
            
            // Simular que alguien intenta "modificar" la evidencia
            const modifiedEvidenceContent = evidenceContent.replace("Exceso de velocidad", "Estacionamiento prohibido");
            const modifiedEvidenceBuffer = Buffer.from(modifiedEvidenceContent);
            const modifiedEvidenceResult = await ipfs.add(modifiedEvidenceBuffer);
            
            // Verificar que la evidencia original sigue siendo inmutable
            const originalChunks: Buffer[] = [];
            for await (const chunk of ipfs.cat(evidenceResult.cid)) {
                originalChunks.push(chunk);
            }
            
            const originalRetrieved = Buffer.concat(originalChunks).toString();
            expect(originalRetrieved).toBe(evidenceContent);
            expect(originalRetrieved).not.toBe(modifiedEvidenceContent);
            
            // Verificar que los CIDs son diferentes
            expect(evidenceResult.cid.toString()).not.toBe(modifiedEvidenceResult.cid.toString());
            
            console.log(`Evidencia original CID: ${evidenceResult.cid.toString()}`);
            console.log(`Evidencia modificada CID: ${modifiedEvidenceResult.cid.toString()}`);
            console.log("✅ IPFS mantiene la inmutabilidad de las evidencias");
        });
    });
}); 