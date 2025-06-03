import { IUserModel } from "./userModel"
import { ITempEmailsModel } from "./tempEmailsModel"
import { IUserInfoModel } from "./userInfoModel"
import { IFriendshipModel } from "./friendshipModel"
import { IFriendshipChatModel } from "./friendshipChatModel"
import { IChatModel } from "./chatModel"
import { IMessageModel } from "./messageModel"

export interface IModels {
    userModel?: IUserModel,
    userInfoModel?: IUserInfoModel,
    tempEmailsModel?: ITempEmailsModel,
    friendshipModel?: IFriendshipModel,
    friendshipChatModel?: IFriendshipChatModel,
    chatModel?: IChatModel,
    messageModel?: IMessageModel,
}