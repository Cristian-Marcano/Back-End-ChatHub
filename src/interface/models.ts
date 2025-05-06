import { IUserModel } from "./userModel"
import { ITempEmailsModel } from "./tempEmailsModel"
import { IUserInfoModel } from "./userInfoModel"

export interface IModels {
    userModel?: IUserModel,
    userInfoModel?: IUserInfoModel,
    tempEmailsModel?: ITempEmailsModel
}