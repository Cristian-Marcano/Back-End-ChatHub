import { Server, Socket } from "socket.io"
import { IModels } from "../interface/models"
import { userEventsHandler } from "./userEvents"
import { chatEventsHandler } from "./chatEvents"
import { friendshipEventsHandler } from "./friendshipEvents"
import { groupEventsHandler } from "./groupEvents"

import { UserService } from "../services/userService"
import { UserController } from "../controllers/userController"
import { ChatService } from "../services/chatService"
import { ChatController } from "../controllers/chatController"
import { FriendshipService } from "../services/friendshipService"
import { FriendshipController } from "../controllers/friendshipController"
import { GroupService } from "../services/groupService"
import { GroupController } from "../controllers/groupController"

let userController: UserController | null = null
let chatController: ChatController | null = null
let friendshipController: FriendshipController | null = null
let groupController: GroupController | null = null

export function socketEventHandler(
    io: Server, 
    socket: Socket, 
    models: IModels
) {
    if (!userController) {
        const userService = new UserService({
            userModel: models.userModel, 
            userInfoModel: models.userInfoModel
        })
        userController = new UserController({userService})
    }
    
    if (!chatController) {
        const chatService = new ChatService({
            chatModel: models.chatModel, 
            messageModel: models.messageModel
        })
        chatController = new ChatController({chatService})
    }

    if (!friendshipController) {
        const friendshipService = new FriendshipService({
            chatModel: models.chatModel,
            friendshipChatModel: models.friendshipChatModel, 
            friendshipModel: models.friendshipModel
        })
        friendshipController = new FriendshipController({friendshipService})
    }

    if (!groupController) {
        const groupService = new GroupService({
            groupModel: models.groupModel
        })
        groupController = new GroupController({groupService})
    }

    userEventsHandler('user', io, socket, userController)
    chatEventsHandler('chat', io, socket, chatController)
    friendshipEventsHandler('friendship', io, socket, friendshipController)
    groupEventsHandler('group', io, socket, groupController)
}