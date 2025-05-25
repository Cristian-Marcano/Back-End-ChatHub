import { UUID } from "node:crypto"
import { PoolConnection, QueryResult } from "mysql2/promise"
import { PaginationNameSchema, PaginationSchema } from "../../schemas/paginationSchemas"
import { FriendshipChatSchema, NicknamesPartialSchema } from "../../schemas/friendshipChatSchemas"
import { FriendshipChat, IFriendshipChatModel } from "../../interface/friendshipChatModel"
import pool from "../../db/mysql"

class FriendshipChatModel implements IFriendshipChatModel {
    async getFriendshipChats({input, id}: { input: PaginationSchema, id: UUID }): Promise<FriendshipChat[]> {
        const { page, pageSize } = input
        const sql = `SELECT c.id AS id, c.create_at AS create_at, IF(f.primary_user_id = UUID_TO_BIN(?), uai1.photo, uai2.photo) AS photo, IF(f.primary_user_id = UUID_TO_BIN(?), 
                    IF(fc.primary_nickname IS NULL, ua1.username, fc.primary_nickname), IF(fc.secondary_nickname IS NULL, ua2.username, fc.secondary_nickname)) AS nickname,
                    IF(f.primary_user_id = UUID_TO_BIN(?), uai1.about, uai2.about) AS about FROM friendship AS f JOIN friendship_chat AS fc ON fc.friendship_id = f.id 
                    JOIN chat AS c ON c.id = fc.chat_id JOIN user_account AS ua1 ON f.primary_user_id = ua1.id JOIN user_account AS ua2 ON f.secondary_user_id = ua2.id 
                    JOIN user_account_info AS uai1 ON ua1.id = uai1.user_id JOIN user_account_info AS uai2 ON ua2.id = uai2.user_id 
                    WHERE f.primary_user_id = UUID_TO_BIN(?) OR f.secondary_user_id = UUID_TO_BIN(?) LIMIT ?, ?`
        const [chats] = await pool.query(sql, [id,id,id,id,page,pageSize]) as QueryResult as [FriendshipChat[]]
        return chats
    }

    async getFriendshipChatsByName({input, id}: { input: PaginationNameSchema, id: UUID }): Promise<FriendshipChat[]> {
        const { page, pageSize } = input
        const sql = `SELECT c.id AS id, c.create_at AS create_at, IF(f.primary_user_id = UUID_TO_BIN(?), uai1.photo, uai2.photo) AS photo, IF(f.primary_user_id = UUID_TO_BIN(?), 
                    IF(fc.primary_nickname IS NULL, ua1.username, fc.primary_nickname), IF(fc.secondary_nickname IS NULL, ua2.username, fc.secondary_nickname)) AS nickname,
                    IF(f.primary_user_id = UUID_TO_BIN(?), uai1.about, uai2.about) AS about FROM friendship AS f JOIN friendship_chat AS fc ON fc.friendship_id = f.id 
                    JOIN chat AS c ON c.id = fc.chat_id JOIN user_account AS ua1 ON f.primary_user_id = ua1.id JOIN user_account AS ua2 ON f.secondary_user_id = ua2.id 
                    JOIN user_account_info AS uai1 ON ua1.id = uai1.user_id JOIN user_account_info AS uai2 ON ua2.id = uai2.user_id 
                    WHERE (f.primary_user_id = UUID_TO_BIN(?) OR f.secondary_user_id = UUID_TO_BIN(?)) AND nickname REGEXP ? LIMIT ?, ?`
        const [chats] = await pool.query(sql, [id,id,id,id,page,pageSize]) as QueryResult as [FriendshipChat[]]
        return chats
    }

    async createFriendshipChat({input}: { input: FriendshipChatSchema }, conn?: PoolConnection): Promise<void> {
        const { friendshipId, chatId } = input
        const execute = conn ?? pool
        await execute.query('INSERT INTO friendship_chat(friendship_id, chat_id) VALUES (?,?)',[friendshipId, chatId])
    }

    async updateFriendshipChat({input, id}: { input: NicknamesPartialSchema, id: number }, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        await execute.query('UPDATE friendship_chat SET ? WHERE id = ?', [input, id])
    }

    async removeFriendshipChat({id}: { id: number }, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        await execute.query('DELETE FROM friendship_chat WHERE id = ?', [id])
    }
}

export const friendshipChatModel = new FriendshipChatModel()