import { Server, Socket } from "socket.io"
import { IModels } from "../interface/models"
import { userEventsHandler } from "./userEvents"
import { chatEventsHandler } from "./chatEvents"
import { friendshipEventsHandler } from "./friendshipEvents"

export function socketEventHandler(
    io: Server, 
    socket: Socket, 
    {
        userModel, 
        userInfoModel,
        chatModel,
        messageModel,
        friendshipModel,
        friendshipChatModel
    }: IModels
) {
    userEventsHandler('user', io, socket, {userModel, userInfoModel})
    chatEventsHandler('chat', io, socket, {chatModel, messageModel})
    friendshipEventsHandler('friendship', io, socket, {friendshipChatModel, friendshipModel, chatModel})
}