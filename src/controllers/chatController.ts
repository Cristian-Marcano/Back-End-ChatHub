import { handleSocketError } from "../utils/socketErrorHandler"
import { Server, Socket } from "socket.io"
import { ChatService } from "../services/chatService"
import { NotificationService } from "../services/notificationService"
import { validatePagination } from "../schemas/paginationSchemas"
import { validateChatId, validateChatHistory, validateMessage, validateMessageView, validateMessageEdit, validateMessageDelete, validateMessageSearch, validateMessageContext } from "../schemas/messageSchemas"

export class ChatController {
    private chatService: ChatService
    private notificationService?: NotificationService

    constructor({chatService, notificationService}: {chatService: ChatService, notificationService?: NotificationService}) {
        this.chatService = chatService
        this.notificationService = notificationService
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
            handleSocketError(error, socket)
        }
    }

    history = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        
        const resultSchema = validateChatHistory(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const history = await this.chatService.historyChat({input: resultSchema.data})
            socket.emit(`${namespace}:historyResults`, {results: history})

        } catch(error:any) {
            handleSocketError(error, socket)
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
            const chatIdStr = resultSchema.data.chatId.toString()
            io.to(chatIdStr).emit(`${namespace}:newMessage`, {results: message})

            // Lógica de Push Notifications
            if (this.notificationService) {
                const chatMembers = await this.chatService.getChatMembers(resultSchema.data.chatId)
                const roomSockets = await io.in(chatIdStr).fetchSockets()
                
                // Mapear qué IDs están online en esa room
                const onlineUsers = new Set(roomSockets.map(s => s.data.id))
                
                for (const memberId of chatMembers) {
                    // Si no soy yo mismo, y no está conectado al socket del chat
                    if (memberId !== id && !onlineUsers.has(memberId)) {
                        await this.notificationService.sendPushToUser(memberId, {
                            title: 'Nuevo Mensaje',
                            body: resultSchema.data.msgText,
                            chatId: resultSchema.data.chatId
                        }).catch(err => console.error(err))
                    }
                }
            }

        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }

    readMessageChat = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        if (data) data.userId = id
        const resultSchema = validateMessageView(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            await this.chatService.readMessageChat({input: resultSchema.data})
            socket.emit(`${namespace}:viewed`, {message: `Message viewed by: ${id}`})

        } catch(error:any) {
            handleSocketError(error, socket)
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
            handleSocketError(error, socket)
        }
    }

    
    searchMessages = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const resultSchema = validateMessageSearch(data)
        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const results = await this.chatService.searchMessagesChat({ input: resultSchema.data })
            socket.emit(`${namespace}:searchResults`, { results })
        } catch (error: any) {
            handleSocketError(error, socket)
        }
    }

    loadContext = async(namespace:string, io: Server, socket: Socket, data: any): Promise<void> => {
        const resultSchema = validateMessageContext(data)
        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const results = await this.chatService.loadContextChat({ input: resultSchema.data })
            socket.emit(`${namespace}:contextResults`, { results })
        } catch (error: any) {
            handleSocketError(error, socket)
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
            handleSocketError(error, socket)
        }
    }



}