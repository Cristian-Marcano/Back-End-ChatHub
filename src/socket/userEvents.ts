import { Server, Socket } from "socket.io"
import { IModels } from "../interface/models"
import { UserService } from "../services/userService"
import { UserController } from "../controllers/userController"

export function userEventsHandler(namespace:string, io: Server, socket: Socket, {userModel, userInfoModel}: IModels) {
    
    const userService = new UserService({userModel, userInfoModel})
    const userController = new UserController({userService})

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