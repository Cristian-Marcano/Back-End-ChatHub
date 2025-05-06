import { UUID } from "node:crypto"
import { PoolConnection } from "mysql2/promise"
import { UserFullInfoSchema, UserInfoSchema } from "../schemas/userInfoSchemas"
import { PaginationUsernameAndEmailSchema } from "../schemas/paginationSchemas"

export interface UserInfo {
    id: UUID,
    username: string,
    email: string,
    create_at: Date,
    idInfo?: number,
    full_name?: string,
    phone?: string,
    photo?: string,
    user_id?: UUID
}

export interface IUserInfoModel {
    getUserInfoById(params: {id: UUID}): Promise<UserInfo[]>

    getUsersInfo(params: {input: PaginationUsernameAndEmailSchema, id: UUID}): Promise<UserInfo[]>

    createUserInfo(params: {input: UserInfoSchema, id: UUID}): Promise<void>

    updateUserInfo(params: {input: UserFullInfoSchema, id: UUID}, conn?: PoolConnection): Promise<void>
}