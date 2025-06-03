import { Server, Socket } from "socket.io"
import { FriendshipService } from "../services/friendshipService" 
import { FriendshipShema, validateFriendship, validateId, validatePartialStates, validateState } from "../schemas/friendshipSchemas" 

export class FriendshipController {
    private friendshipService: FriendshipService

    constructor({friendshipService}: {friendshipService: FriendshipService}) {
        this.friendshipService = friendshipService
    }

    sent = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        data.primary_user_id = id
        const resultSchema = validateFriendship(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            await this.friendshipService.sentFriendship({input:resultSchema.data})

            const { secondary_user_id } = resultSchema.data
            const data_secondary_user = await this.friendshipService.infoUserSecondary({id: secondary_user_id })

            socket.emit(`${namespace}:received`, {message: 'Server registered friendship'})
            socket.emit(`${namespace}:${secondary_user_id}`, {results: data_secondary_user})

        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }

    action = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = data, { id: userId } = socket.data, { state } = data

        const resultSchema = validateState(state)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            await this.friendshipService.actionFriendship({input: state, id})

        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
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
            const { id } = socket.data
            const friendship = await this.friendshipService.acceptFriendship({id: resultSchema.data})

            socket.emit(`${namespace}:results`, {results: friendship})
        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
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
            const { id } = socket.data
            const friendship = await this.friendshipService.rejectionFriendship({id: resultSchema.data})

            socket.emit(`${namespace}:rejected`, {message: friendship})
        } catch(error:any) {
            socket.emit('error:server', {message: `La solicitud ${id} ha sido rechazada`})
        }
    }

    load = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = data

        const resultSchema = validateId(id)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const friendshipsChats = await this.friendshipService.loadFriendships(id)

            socket.emit(`${namespace}:results`, {results: friendshipsChats})
        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }

    request = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = data

        const resultSchema = validateState(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const requests = await this.friendshipService.requestFriendships({ state: resultSchema.data, id })

            socket.emit(`${namespace}:results`, {results: requests})
        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }
}