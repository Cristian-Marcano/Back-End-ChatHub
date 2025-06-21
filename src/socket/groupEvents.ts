import { Server, Socket } from "socket.io"
import { GroupController } from "../controllers/groupController"

export function groupEventsHandler(namespace: string, io: Server, socket: Socket, groupController: GroupController) {

    socket.on(`${namespace}:create`, (data) => {
        groupController.create(namespace, io, socket, data)
    })

    socket.on(`${namespace}:addMember`, (data) => {
        groupController.addMember(namespace, io, socket, data)
    })

    socket.on(`${namespace}:leave`, (data) => {
        groupController.leave(namespace, io, socket, data)
    })
}
