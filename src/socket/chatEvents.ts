import { Server, Socket } from "socket.io"
import { IModels } from "../interface/models"
import { FriendshipController } from "../controllers/friendshipController"
import { ChatService } from "../services/chatService" 
import { ChatController } from "../controllers/chatController"

export function chatEventsHandler(namespace:string, io: Server, socket: Socket, {chatModel,messageModel}: IModels) {

    const chatService = new ChatService({chatModel, messageModel})
    const chatController = new ChatController({chatService})

    socket.on(`${namespace}:getAll`, (data)=> {
        chatController.getAll(namespace, io, socket, data)
    })

    socket.on(`${namespace}:history`, (data)=> {
        chatController.history(namespace, io, socket, data)
    })

    socket.on(`${namespace}:typing`, (data)=> {
        chatController.typing(namespace, io, socket, data)
    })

    socket.on(`${namespace}:sendMessage`, (data)=> {
        chatController.sendMessageChat(namespace, io, socket, data)
    })

    socket.on(`${namespace}:readMessage`, (data)=> {
        chatController.readMessageChat(namespace, io, socket, data)
    })
}