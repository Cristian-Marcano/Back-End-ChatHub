import { handleSocketError } from "../utils/socketErrorHandler"
import { Server, Socket } from "socket.io"
import { FriendshipService } from "../services/friendshipService" 
import { FriendshipShema, validateFriendship, validateId, validatePartialStates, validateState } from "../schemas/friendshipSchemas" 

export class FriendshipController {
    private friendshipService: FriendshipService

    constructor({friendshipService}: {friendshipService: FriendshipService}) {
        this.friendshipService = friendshipService
    }

    sent = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data;
        const targetId = data.secondary_user_id;
        
        // Fix for check_user_order constraint: primary_user_id MUST be < secondary_user_id
        const isPrimary = id < targetId;
        data.primary_user_id = isPrimary ? id : targetId;
        data.secondary_user_id = isPrimary ? targetId : id;
        
        const resultSchema = validateFriendship(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const friendshipId = await this.friendshipService.sentFriendship({input:resultSchema.data})

            const data_sender_user = await this.friendshipService.infoUserSecondary({id: id });
            
            const payload = data_sender_user && data_sender_user.length > 0 ? {
                ...data_sender_user[0],
                id: friendshipId // Overwrite user ID with friendship ID so the frontend can accept/reject using the correct ID
            } : null;

            socket.emit(`${namespace}:received`, {message: 'Server registered friendship'});
            if (payload) {
                io.to(targetId).emit(`${namespace}:newRequest`, {results: payload});
            }

        } catch(error:any) {
            console.error('Error in sentFriendship:', error);
            handleSocketError(error, socket)
        }
    }

    action = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id, state } = data

        const resultSchema = validateState(state)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const friendship = await this.friendshipService.actionFriendship({input: state, id})

            if (friendship) {
                const { primary_user_id, secondary_user_id } = friendship as { primary_user_id: string, secondary_user_id: string }
                io.to(primary_user_id).emit(`${namespace}:actionUpdated`, {results: friendship})
                io.to(secondary_user_id).emit(`${namespace}:actionUpdated`, {results: friendship})
            }
        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }

    accept = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = data

        const resultSchema = validateId(id)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const friendship = await this.friendshipService.acceptFriendship({id: resultSchema.data})

            if (friendship) {
                const { primary_user_id, secondary_user_id } = friendship as { primary_user_id: string, secondary_user_id: string }
                io.to(primary_user_id).emit(`${namespace}:accepted`, {results: friendship})
                io.to(secondary_user_id).emit(`${namespace}:accepted`, {results: friendship})
            }
        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }

    rejection = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = data

        const resultSchema = validateId(id)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const friendship = await this.friendshipService.rejectionFriendship({id: resultSchema.data})

            if (friendship) {
                const { primary_user_id, secondary_user_id } = friendship as { primary_user_id: string, secondary_user_id: string }
                io.to(primary_user_id).emit(`${namespace}:rejected`, {results: friendship})
                io.to(secondary_user_id).emit(`${namespace}:rejected`, {results: friendship})
            }
        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }

    
    
    unblock = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id: userId } = socket.data;
        const { chatId } = data
        if (!chatId) return;

        try {
            const friendship = await this.friendshipService.unblockUserByChatId({chatId: Number(chatId), userId})

            if (friendship) {
                const { primary_user_id, secondary_user_id } = friendship as { primary_user_id: string, secondary_user_id: string }
                // Emitir a ambos que la relación fue desbloqueada
                io.to(primary_user_id).emit(`${namespace}:unblocked`, {results: friendship})
                io.to(secondary_user_id).emit(`${namespace}:unblocked`, {results: friendship})
            }
        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }

    block = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id: userId } = socket.data;
        const { chatId } = data
        if (!chatId) return;

        try {
            const friendship = await this.friendshipService.blockUserByChatId({chatId: Number(chatId), userId})

            if (friendship) {
                const { primary_user_id, secondary_user_id } = friendship as { primary_user_id: string, secondary_user_id: string }
                // Emitir a ambos que la relación fue bloqueada
                io.to(primary_user_id).emit(`${namespace}:blocked`, {results: friendship})
                io.to(secondary_user_id).emit(`${namespace}:blocked`, {results: friendship})
            }
        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }


    load = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data

        try {
            const friendshipsChats = await this.friendshipService.requestFriendships({ state: 'accepted', id })

            socket.emit(`${namespace}:results`, {results: friendshipsChats})
        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }

    request = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data

        try {
            const requests = await this.friendshipService.requestFriendships({ state: 'pending', id })

            socket.emit(`${namespace}:results`, {results: requests})
        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }
}