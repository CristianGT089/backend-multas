import { Request, Response, NextFunction } from 'express';
/**
 * Registra una multa en la blockBlockchainFineStatuschain y sube la evidencia a IPFS.
 */
export declare const registerFine: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Actualiza el estado de una multa en la blockchain.
 */
export declare const updateFineStatus: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obtiene los detalles de una multa desde la blockchain.
 */
export declare const getFine: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obtiene los detalles de todas las multas desde la blockchain.
 */
export declare const getFines: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obtiene la evidencia de una multa desde IPFS.
 */
export declare const getFineEvidence: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Verifica la integridad de la blockchain.
 */
export declare const verifyBlockchainIntegrity: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obtiene datos de multas desde Apitude/SIMIT.
 */
export declare const getFineFromSIMIT: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Enlaza una multa con un ID de SIMIT.
 */
export declare const linkFineToSIMIT: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Obtiene multas por número de placa.
 */
export declare const getFinesByPlate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obtiene el historial de estados de una multa.
 */
export declare const getFineStatusHistory: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obtiene el histórico de las 10 multas más recientes
 */
export declare const getRecentFinesHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
