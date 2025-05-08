import { UUID } from "node:crypto"
import { QueryResult } from "mysql2/promise"
import { PoolConnection } from "mysql2/promise"
import pool from "../../db/mysql"
import { IUserInfoModel, UserInfo } from "../../interface/userInfoModel"
import { UserInfoSchema, UserFullInfoSchema } from "../../schemas/userInfoSchemas"
import { PaginationUsernameAndEmailSchema } from "../../schemas/paginationSchemas"

class UserInfoModel implements IUserInfoModel {
    async getUserInfoById({id}: {id: UUID}): Promise<UserInfo[]> {
        const [users] = await pool.query(`SELECT BIN_TO_UUID(ua.id) AS id, ua.username, ua.email, ua.create_at, uai.id AS idInfo, uai.full_name, uai.phone, uai.photo, 
                                            BIN_TO_UUID(uai.user_id) AS user_id FROM user_account AS ua LEFT JOIN user_account_info AS uai ON ua.id = uai.user_id
                                            WHERE ua.id = UUID_TO_BIN(?)`, [id]) as QueryResult as [UserInfo[]]
        return users
    }

    async getUsersInfo({input, id}: {input: PaginationUsernameAndEmailSchema, id: UUID}): Promise<UserInfo[]> {
        const { username, email, page, pageSize } = input
        const sql = `SELECT BIN_TO_UUID(ua.id) AS id, ua.username, ua.email, ua.create_at, uai.id AS idInfo, uai.full_name, uai.phone, uai.photo, 
                        BIN_TO_UUID(uai.user_id) AS user_id FROM user_account AS ua LEFT JOIN user_account_info AS uai ON ua.id = uai.user_id
                        WHERE`
        if(username) {
            const [users] = await pool.query(`${sql} ua.username REGEXP ? AND ua.id <> UUID_TO_BIN(?) LIMIT ?, ?`, [username, id, page, pageSize]) as QueryResult as [UserInfo[]]
            return users
        }
        const [users] = await pool.query(`${sql} ua.email REGEXP ? AND ua.id <> UUID_TO_BIN(?) LIMIT ?, ?`, [email, id, page, pageSize]) as QueryResult as [UserInfo[]]
        return users
    }

    async createUserInfo({input, id}: {input: UserInfoSchema, id: UUID}): Promise<void> {
        const { full_name, phone, photo } = input
        await pool.query(`INSERT INTO user_account_info(full_name, phone, photo, user_id) VALUES (?,?,?,?)`, [full_name, phone, photo, id])
    }

    async updateUserInfo({input, id}: {input: UserFullInfoSchema, id: UUID}, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        await execute.query(`UPDATE user_account_info SET ? WHERE user_id = UUID_TO_BIN(?)`, [input, id])
    }
}

export const userInfoModel = new UserInfoModel()