import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IPFSService } from '../../../src/fine/services/ipfs.service.js';
import { IPFSRepository } from '../../../src/fine/repositories/ipfs.repository.js';

const ipfsService = IPFSService.getInstance();

// Mock del repositorio IPFS
vi.mock('../../../src/fine/repositories/ipfs.repository.js', () => {
  const mockRepository = {
    initialize: vi.fn(),
    isConnected: vi.fn(),
    uploadToIPFS: vi.fn(),
    getFromIPFS: vi.fn(),
    getInstance: vi.fn()
  };

  return {
    IPFSRepository: {
      getInstance: vi.fn(() => mockRepository)
    }
  };
});

describe('IPFS Service', () => {
  let repository: any;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    vi.clearAllMocks();
    repository = IPFSRepository.getInstance();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('initialize', () => {
    it('debe inicializar el repositorio correctamente', async () => {
      await ipfsService.initialize();
      expect(repository.initialize).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores durante la inicialización', async () => {
      repository.initialize.mockRejectedValue(new Error('Error de inicialización'));
      
      await expect(ipfsService.initialize()).rejects.toThrow('Error de inicialización');
      expect(repository.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('isConnected', () => {
    it('debe verificar la conexión correctamente cuando está conectado', async () => {
      repository.isConnected.mockResolvedValue(true);
      
      const result = await ipfsService.isConnected();
      
      expect(result).toBe(true);
      expect(repository.isConnected).toHaveBeenCalledTimes(1);
    });

    it('debe verificar la conexión correctamente cuando está desconectado', async () => {
      repository.isConnected.mockResolvedValue(false);
      
      const result = await ipfsService.isConnected();
      
      expect(result).toBe(false);
      expect(repository.isConnected).toHaveBeenCalledTimes(1);
    });
  });

  describe('uploadToIPFS', () => {
    it('debe subir un archivo correctamente', async () => {
      const mockFileBuffer = Buffer.from('test file');
      const mockFileName = 'test.txt';
      const mockCID = 'QmTest123';

      repository.uploadToIPFS.mockResolvedValue(mockCID);
      
      const result = await ipfsService.uploadToIPFS(mockFileBuffer, mockFileName);
      
      expect(result).toBe(mockCID);
      expect(repository.uploadToIPFS).toHaveBeenCalledWith(mockFileBuffer, mockFileName);
    });

    it('debe manejar errores durante la subida', async () => {
      const mockFileBuffer = Buffer.from('test file');
      const mockFileName = 'test.txt';

      repository.uploadToIPFS.mockRejectedValue(new Error('Error de subida'));
      
      await expect(ipfsService.uploadToIPFS(mockFileBuffer, mockFileName))
        .rejects.toThrow('Error de subida');
      expect(repository.uploadToIPFS).toHaveBeenCalledWith(mockFileBuffer, mockFileName);
    });
  });

  describe('getFromIPFS', () => {
    it('debe obtener un archivo correctamente', async () => {
      const mockCID = 'QmTest123';
      const mockData = [new Uint8Array([1, 2, 3])];

      repository.getFromIPFS.mockResolvedValue(mockData);
      
      const result = await ipfsService.getFromIPFS(mockCID);
      
      expect(result).toEqual(mockData);
      expect(repository.getFromIPFS).toHaveBeenCalledWith(mockCID);
    });

    it('debe manejar errores al obtener un archivo', async () => {
      const mockCID = 'QmTest123';

      repository.getFromIPFS.mockRejectedValue(new Error('Error al obtener archivo'));
      
      await expect(ipfsService.getFromIPFS(mockCID))
        .rejects.toThrow('Error al obtener archivo');
      expect(repository.getFromIPFS).toHaveBeenCalledWith(mockCID);
    });
  });
}); 