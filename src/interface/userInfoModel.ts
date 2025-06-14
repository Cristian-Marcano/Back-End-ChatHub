import { UUID } from "node:crypto"
import { PoolConnection } from "mysql2/promise"
import { UserInfoPartialSchema, UserInfoSchema } from "../schemas/userInfoSchemas"
import { PaginationUsernameAndEmailSchema } from "../schemas/paginationSchemas"

export interface UserInfo {
    id: UUID,
    username: string,
    email: string,
    create_at: Date,
    idInfo: number|null,
    full_name: string|null,
    phone: string|null,
    photo: string|null,
    about: string|null
}

export interface IUserInfoModel {
    getUserInfoById(params: {id: UUID}): Promise<UserInfo[]>

    getUsersInfo(params: {input: PaginationUsernameAndEmailSchema, id: UUID}): Promise<UserInfo[]>

    createUserInfo(params: {input: UserInfoSchema, id: UUID}): Promise<void>

    updateUserInfo(params: {input: UserInfoPartialSchema, id: UUID}, conn?: PoolConnection): Promise<void>
}