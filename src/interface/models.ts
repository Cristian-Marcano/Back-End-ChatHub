import { IUserModel } from "./userModel"
import { ITempEmailsModel } from "./tempEmailsModel"
import { IUserInfoModel } from "./userInfoModel"
import { IFriendshipModel } from "./friendshipModel"

export interface IModels {
    userModel?: IUserModel,
    userInfoModel?: IUserInfoModel,
    tempEmailsModel?: ITempEmailsModel,
    friendshipModel?: IFriendshipModel
}