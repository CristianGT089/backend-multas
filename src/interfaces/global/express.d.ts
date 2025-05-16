import { Multer } from 'multer';

declare global {
    namespace Express {
        interface Request {
            file?: Multer.File; // Archivo único (upload.single)
            files?: Multer.File[] | { [fieldname: string]: Multer.File[] }; // Archivos múltiples (upload.array o upload.fields)
        }
    }
} 