import { IUserModel } from "./userModel"
import { ITempEmailsModel } from "./tempEmailsModel"
import { IUserInfoModel } from "./userInfoModel"
import { IFriendshipModel } from "./friendshipModel"
import { IFriendshipChatModel } from "./friendshipChatModel"
import { IChatModel } from "./chatModel"
import { IMessageModel } from "./messageModel"
import { IGroupModel } from "./groupModel"
import { IPasswordResetsModel } from "./passwordResetsModel"
import { IRefreshTokensModel } from "./refreshTokensModel"
import { IPushSubscriptionsModel } from "./pushSubscriptionsModel"

export interface IModels {
    userModel?: IUserModel,
    userInfoModel?: IUserInfoModel,
    tempEmailsModel?: ITempEmailsModel,
    friendshipModel?: IFriendshipModel,
    friendshipChatModel?: IFriendshipChatModel,
    chatModel?: IChatModel,
    messageModel?: IMessageModel,
    groupModel?: IGroupModel,
    passwordResetsModel?: IPasswordResetsModel,
    refreshTokensModel?: IRefreshTokensModel,
    pushSubscriptionsModel?: IPushSubscriptionsModel
}
