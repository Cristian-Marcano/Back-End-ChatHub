import { Server, Socket } from "socket.io"
import { ChatService } from "../services/chatService"
import { validatePagination } from "../schemas/paginationSchemas"
import { validateChatId, validateMessage, validateMessageView, validateMessageEdit, validateMessageDelete } from "../schemas/messageSchemas"

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
            
            if (Array.isArray(chats)) {
                chats.forEach(chat => socket.join(chat.id.toString()))
            }

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
        const { id } = socket.data
        if (data && data.chatId) {
            socket.to(data.chatId.toString()).emit(`${namespace}:typing`, { userId: id, chatId: data.chatId })
        }
    }

    sendMessageChat = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        const resultSchema = validateMessage(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const message = await this.chatService.sendMessageChat({input: resultSchema.data, id})
            io.to(resultSchema.data.chatId.toString()).emit(`${namespace}:newMessage`, {results: message})

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

    editMessageChat = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        const resultSchema = validateMessageEdit(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            await this.chatService.editMessageChat({input: resultSchema.data, id})
            // Emite al cuarto del chat que el mensaje fue editado
            io.to(resultSchema.data.chatId.toString()).emit(`${namespace}:messageEdited`, {
                messageId: resultSchema.data.messageId, 
                newText: resultSchema.data.msgText
            })

        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }

    deleteMessageChat = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        const resultSchema = validateMessageDelete(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            await this.chatService.deleteMessageChat({input: resultSchema.data, id})
            // Emite al cuarto del chat que el mensaje fue borrado
            io.to(resultSchema.data.chatId.toString()).emit(`${namespace}:messageDeleted`, {
                messageId: resultSchema.data.messageId
            })

        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }



}