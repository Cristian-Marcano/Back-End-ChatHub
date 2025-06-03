import { Server, Socket } from "socket.io"
import { IModels } from "../interface/models"
import { FriendshipController } from "../controllers/friendshipController"
import { FriendshipService } from "../services/friendshipService"

export function friendshipEventsHandler(namespace:string, io: Server, socket: Socket, {friendshipChatModel, friendshipModel, chatModel}: IModels) {

    const friendshipService = new FriendshipService({chatModel,friendshipChatModel,friendshipModel})
    const friendshipController = new FriendshipController({friendshipService})

    socket.on(`${namespace}:sent`, (data)=> {
        friendshipController.sent(namespace, io, socket, data)
    })

    socket.on(`${namespace}:action`, (data)=> {
        friendshipController.action(namespace, io, socket, data)
    })

    socket.on(`${namespace}:accept`, (data)=> {
        friendshipController.accept(namespace, io, socket, data)
    })

    socket.on(`${namespace}:rejection`, (data)=> {
        friendshipController.rejection(namespace, io, socket, data)
    })

    socket.on(`${namespace}:load`, (data)=> { //Muestra las relaciones de amistad ya establecidas
        friendshipController.load(namespace, io, socket, data)
    })

    socket.on(`${namespace}:request`, (data)=> { //Muestra las solicitudes de amistades recibidas
        friendshipController.request(namespace, io, socket, data)
    })
}