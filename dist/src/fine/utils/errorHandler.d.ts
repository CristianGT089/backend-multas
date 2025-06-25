import { Request, Response, NextFunction } from 'express';
export interface HttpError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string;
    reason?: string;
    transactionHash?: string;
    receipt?: any;
    isAxiosError?: boolean;
    response?: {
        status?: number;
        data?: any;
    };
}
export declare const globalErrorHandler: (err: HttpError, req: Request, res: Response, next: NextFunction) => void;
export declare class AppError extends Error implements HttpError {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
