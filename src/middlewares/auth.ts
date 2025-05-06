import { ExtendedError, Socket } from "socket.io"
import { validateToken } from "../utils/token"
import { AuthPayload } from "../interface/auth"

export const authMiddleware = (socket: Socket, next: (err?: ExtendedError) => void): void => {
    const token  = socket.handshake.headers['authorization'] ?? socket.handshake.auth?.token

    if(!token) {
        return next(new Error('No token provided'))
    }

    try {
        const decoded = validateToken(token) as AuthPayload
        socket.data = decoded

        next()
    } catch(error: any) {
        return next(new Error('Invalid token'))
    }
}