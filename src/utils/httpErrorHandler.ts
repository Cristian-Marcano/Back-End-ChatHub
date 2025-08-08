import { Response } from "express";

export const handleHttpError = (error: any, res: Response) => {
    console.error('HTTP Error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ message: 'Esta acción ya fue realizada o ya existe el registro.' });
        return;
    }

    if (process.env.NODE_ENV === 'development') {
        res.status(500).json({ 
            message: error.message || 'Error del servidor (Dev)',
            code: error.code,
            stack: error.stack 
        });
    } else {
        res.status(500).json({ message: 'Server error' });
    }
};
