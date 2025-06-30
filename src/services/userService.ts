import { UUID } from "node:crypto"
import { IModels } from "../interface/models"
import { IUserModel } from "../interface/userModel"
import { IUserInfoModel } from "../interface/userInfoModel"
import { PaginationUsernameAndEmailSchema } from "../schemas/paginationSchemas"
import { UserInfoPartialSchema, UserInfoSchema } from "../schemas/userInfoSchemas"
import { withTransaction } from "../db/mysql/transaction"
import { UserPartialSchema } from "../schemas/userSchemas"

export class UserService {
    private userModel: IUserModel
    private userInfoModel: IUserInfoModel

    constructor({userModel, userInfoModel}: IModels) {
        if(!userModel || !userInfoModel)
            throw new Error(`
                ${(!userModel && !userInfoModel) ? 'userModel and userInfoModel': (!userModel) ? 'userModel' : 'userInfoModel'} is required in UserService
            `)
        
        this.userModel = userModel
        this.userInfoModel = userInfoModel
    }

    async searchUser({input, id}: {input: PaginationUsernameAndEmailSchema, id: UUID}) {
        const { page, pageSize } = input
        input.page = (page - 1) * pageSize //* Es necesario para establecer de que registro a que otro obtener los datos en la DB
        return this.userInfoModel.getUsersInfo({input, id})
    }

    async getUserInfoById({id}: {id: UUID}) {
        const users = await this.userInfoModel.getUserInfoById({id})
        if (!users || users.length === 0) return null
        return users[0]
    }

    async createUserInfo({input, id}: {input: UserInfoSchema, id: UUID}) {
        return this.userInfoModel.createUserInfo({input, id})
    }

    async updateUser({input, inputInfo, id}: {input: UserPartialSchema, inputInfo: UserInfoPartialSchema, id: UUID}) {
        return withTransaction(async(conn) => {
            await this.userModel.updateUser({input, id}, conn)
            await this.userInfoModel.updateUserInfo({input:inputInfo, id}, conn)
        })
    }

    async upsertUserInfo({input, id}: {input: UserInfoSchema, id: UUID}) {
        return this.userInfoModel.upsertUserInfo({input, id})
    }

    async updateUserInfoOnly({input, id}: {input: UserInfoPartialSchema, id: UUID}) {
        return this.userInfoModel.updateUserInfo({input, id})
    }
}