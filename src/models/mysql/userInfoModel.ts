import { UUID } from "node:crypto"
import { QueryResult } from "mysql2/promise"
import { PoolConnection } from "mysql2/promise"
import pool from "../../db/mysql"
import { IUserInfoModel, UserInfo } from "../../interface/userInfoModel"
import { UserInfoSchema, UserInfoPartialSchema } from "../../schemas/userInfoSchemas"
import { PaginationUsernameAndEmailSchema } from "../../schemas/paginationSchemas"

class UserInfoModel implements IUserInfoModel {
    async getUserInfoById({id}: {id: UUID}): Promise<UserInfo[]> {
        const [users] = await pool.query(`SELECT BIN_TO_UUID(ua.id) AS id, ua.username, ua.email, ua.create_at, uai.id AS idInfo, uai.full_name, uai.phone, uai.photo, 
                                            about FROM user_account AS ua LEFT JOIN user_account_info AS uai ON ua.id = uai.user_id
                                            WHERE ua.id = UUID_TO_BIN(?)`, [id]) as QueryResult as [UserInfo[]]
        return users
    }

    async getUsersInfo({input, id}: {input: PaginationUsernameAndEmailSchema, id: UUID}): Promise<UserInfo[]> {
        const { username, email, page, pageSize } = input
        
        // Excluimos usuarios que ya tienen una relación de amistad (pendiente, aceptada, etc) con el usuario actual
        const excludeFriendshipsSQL = `
            ua.id NOT IN (
                SELECT primary_user_id FROM friendship WHERE secondary_user_id = UUID_TO_BIN(?)
                UNION
                SELECT secondary_user_id FROM friendship WHERE primary_user_id = UUID_TO_BIN(?)
            )
        `
        
        const sql = `SELECT BIN_TO_UUID(ua.id) AS id, ua.username, ua.email, ua.create_at, uai.id AS idInfo, uai.full_name, uai.phone, uai.photo, 
                        about FROM user_account AS ua LEFT JOIN user_account_info AS uai ON ua.id = uai.user_id
                        WHERE ${excludeFriendshipsSQL} AND ua.id <> UUID_TO_BIN(?) AND`
                        
        if(username) {
            const [users] = await pool.query(`${sql} ua.username REGEXP ? LIMIT ?, ?`, [id, id, id, username, page, pageSize]) as QueryResult as [UserInfo[]]
            return users
        }
        const [users] = await pool.query(`${sql} ua.email REGEXP ? LIMIT ?, ?`, [id, id, id, email, page, pageSize]) as QueryResult as [UserInfo[]]
        return users
    }

    async createUserInfo({input, id}: {input: UserInfoSchema, id: UUID}): Promise<void> {
        const { full_name, phone, photo, about } = input
        const photoStr = photo ? JSON.stringify(photo) : null
        await pool.query(`INSERT INTO user_account_info(full_name, phone, photo, about, user_id) VALUES (?,?,?,?,UUID_TO_BIN(?))`, [full_name, phone, photoStr, about, id])
    }

    async updateUserInfo({input, id}: {input: UserInfoPartialSchema, id: UUID}, conn?: PoolConnection): Promise<void> {
        if (Object.keys(input).length === 0) return
        const execute = conn ?? pool
        const updateData: Record<string, unknown> = { ...input }
        if (updateData.photo !== undefined) {
            updateData.photo = updateData.photo ? JSON.stringify(updateData.photo) : null
        }
        await execute.query(`UPDATE user_account_info SET ? WHERE user_id = UUID_TO_BIN(?)`, [updateData, id])
    }

    async upsertUserInfo({input, id}: {input: UserInfoSchema, id: UUID}): Promise<void> {
        const { full_name, phone, photo, about } = input
        const photoStr = photo ? JSON.stringify(photo) : null
        await pool.query(`
            INSERT INTO user_account_info (full_name, phone, photo, about, user_id) 
            VALUES (?, ?, ?, ?, UUID_TO_BIN(?))
            ON DUPLICATE KEY UPDATE 
                full_name = VALUES(full_name),
                phone = VALUES(phone),
                photo = VALUES(photo),
                about = VALUES(about)
        `, [full_name, phone, photoStr, about, id])
    }
}

export const userInfoModel = new UserInfoModel()