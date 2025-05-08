import { Server, Socket } from "socket.io"
import { IModels } from "../interface/models"
import { userEventsHandler } from "./userEvents"

export function socketEventHandler(io: Server, socket: Socket, {userModel, userInfoModel}: IModels) {

    userEventsHandler('user', io, socket, {userModel, userInfoModel})
    
}