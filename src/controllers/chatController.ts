import { Server, Socket } from "socket.io"
import { ChatService } from "../services/chatService"
import { validatePagination } from "../schemas/paginationSchemas"
import { validateChatId, validateMessage, validateMessageView } from "../schemas/messageSchemas"

export class ChatController {
    private chatService: ChatService

    constructor({chatService}: {chatService: ChatService}) {
        this.chatService = chatService
    }

    getAll = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        
        const resultSchema = validatePagination(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const chats  = await this.chatService.getAllChat({input: resultSchema.data, id })
            socket.emit(`${namespace}:results`, {results: chats})

        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }

    history = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        
        const resultSchema = validateChatId(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const history = await this.chatService.historyChat({id: resultSchema.data})
            socket.emit(`${namespace}:results`, {results: history})

        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }

    typing = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {

        socket.emit(`${namespace}:result`, {message: 'Escribiendo...'})
    }

    sendMessageChat = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        const resultSchema = validateMessage(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            await this.chatService.sendMessageChat({input: resultSchema.data})
            socket.emit(`${namespace}:newMessage`, {message: `New message from: ${id}`})

        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }

    readMessageChat = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        const resultSchema = validateMessageView(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            await this.chatService.readMessageChat({input: resultSchema.data})
            socket.emit(`${namespace}:viewed`, {message: `Message viewed by: ${id}`})

        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }



}