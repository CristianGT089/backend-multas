import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { globalErrorHandler, AppError, HttpError } from '../../../src/fine/utils/errorHandler.js';

describe('Error Handler Utils', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let jsonSpy: ReturnType<typeof vi.fn>;
  let statusSpy: ReturnType<typeof vi.fn>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Configurar NODE_ENV
    process.env.NODE_ENV = 'development';
    
    // Configurar los mocks para cada prueba
    jsonSpy = vi.fn();
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });
    mockRequest = {
      method: 'GET',
      originalUrl: '/test',
      body: {}
    };
    mockResponse = {
      status: statusSpy,
      json: jsonSpy
    };
    nextFunction = vi.fn();
    
    // Espiar console.error
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restaurar NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('AppError', () => {
    it('debe crear una instancia de error con las propiedades correctas', () => {
      const message = 'Error de prueba';
      const statusCode = 400;
      const error = new AppError(message, statusCode);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('globalErrorHandler', () => {
    it('debe manejar errores operacionales correctamente', () => {
      const error = new AppError('Error operacional', 400);
      
      globalErrorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: 'Error operacional',
        stack: expect.any(String)
      }));
    });

    it('debe manejar errores de blockchain correctamente', () => {
      const error: HttpError = new Error('Error de blockchain');
      error.code = 'CALL_EXCEPTION';
      error.reason = 'Transacción revertida';
      
      globalErrorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: 'Blockchain error: Transacción revertida',
        stack: expect.any(String)
      }));
    });

    it('debe manejar errores de gas impredecible', () => {
      const error: HttpError = new Error('Error de gas');
      error.code = 'UNPREDICTABLE_GAS_LIMIT';
      
      globalErrorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: 'Blockchain error: Unpredictable gas limit. Check transaction parameters.',
        stack: expect.any(String)
      }));
    });

    it('debe registrar los detalles del error en la consola', () => {
      const error = new AppError('Error de prueba', 400);
      
      globalErrorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(consoleSpy).toHaveBeenCalledTimes(6); // Log header, timestamp, route, message, stack, end log
      expect(consoleSpy).toHaveBeenCalledWith('--- ERROR LOG ---');
      expect(consoleSpy).toHaveBeenCalledWith('Error Message:', 'Error de prueba');
    });

    it('debe manejar errores con cuerpo de solicitud', () => {
      const requestWithBody = {
        ...mockRequest,
        body: { data: 'test data' }
      };
      const error = new AppError('Error con body', 400);
      
      globalErrorHandler(
        error,
        requestWithBody as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(consoleSpy).toHaveBeenCalledWith('Request Body:', JSON.stringify({ data: 'test data' }, null, 2));
    });

    it('debe manejar errores en producción sin mostrar detalles sensibles', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Error interno');
      
      globalErrorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went very wrong!'
      });
    });
  });
}); 