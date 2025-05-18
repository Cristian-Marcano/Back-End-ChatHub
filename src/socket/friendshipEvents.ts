import { Server, Socket } from "socket.io"
import { IModels } from "../interface/models"

export function friendshipEventsHandler(namespace:string, io: Server, socket: Socket, {}: IModels) {
    socket.on(`${namespace}:sent`, (data)=> {
    })

    socket.on(`${namespace}:action`, (data)=> {
    })

    socket.on(`${namespace}:accept`, (data)=> {
    })

    socket.on(`${namespace}:load`, (data)=> { //Muestra las relaciones de amistad ya establecidas
    })

    socket.on(`${namespace}:request`, (data)=> { //Muestra las solicitudes de amistades recibidas
    })
}