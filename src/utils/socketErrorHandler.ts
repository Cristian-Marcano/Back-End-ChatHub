import { Socket } from "socket.io";

export const handleSocketError = (error: any, socket: Socket) => {
    console.error('Socket Error:', error);

    // Business Logic / Expected errors we always want to show to the user
    if (error.code === 'ER_DUP_ENTRY') {
        socket.emit('error:server', { message: 'Esta acción ya fue realizada o ya existe el registro.' });
        return;
    }

    if (process.env.NODE_ENV === 'development') {
        // En desarrollo mostramos el error exacto y opcionalmente el código
        socket.emit('error:server', { 
            message: error.message || 'Error del servidor (Dev)',
            code: error.code,
            stack: error.stack 
        });
    } else {
        // En producción ocultamos detalles internos
        socket.emit('error:server', { message: 'Server error' });
    }
};
