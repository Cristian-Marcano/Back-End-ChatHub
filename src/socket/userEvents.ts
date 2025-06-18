import { Server, Socket } from "socket.io"
import { UserController } from "../controllers/userController"

export function userEventsHandler(namespace:string, io: Server, socket: Socket, userController: UserController) {

    socket.on(`${namespace}:search`, (data) => {
        userController.search(namespace, io, socket, data)
    })

    socket.on(`${namespace}:create-info`, (data) => {
        userController.createInfo(namespace, io, socket, data)
    })

    socket.on(`${namespace}:update`, (data) => {
        userController.update(namespace, io, socket, data)
    })
}