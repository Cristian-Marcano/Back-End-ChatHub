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
    
    socket.on(`${namespace}:getMembers`, (data) => {
        groupController.getMembers(namespace, io, socket, data)
    })
    
    socket.on(`${namespace}:kickMember`, (data) => {
        groupController.kickMember(namespace, io, socket, data)
    })
    
    socket.on(`${namespace}:updateRole`, (data) => {
        groupController.updateRole(namespace, io, socket, data)
    })
    
    socket.on(`${namespace}:updateSettings`, (data) => {
        groupController.updateSettings(namespace, io, socket, data)
    })
}
