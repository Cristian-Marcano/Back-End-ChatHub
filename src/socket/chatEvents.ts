import { Server, Socket } from "socket.io"
import { ChatController } from "../controllers/chatController"

export function chatEventsHandler(namespace:string, io: Server, socket: Socket, chatController: ChatController) {

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