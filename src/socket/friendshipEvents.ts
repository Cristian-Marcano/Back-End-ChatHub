import { Server, Socket } from "socket.io"
import { FriendshipController } from "../controllers/friendshipController"

export function friendshipEventsHandler(namespace:string, io: Server, socket: Socket, friendshipController: FriendshipController) {

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