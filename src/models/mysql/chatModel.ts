import { UUID } from "node:crypto"
import { ChatMessage, IChatModel } from "../../interface/chatModel"
import { PoolConnection, QueryResult, ResultSetHeader } from "mysql2/promise"
import { PaginationNameSchema, PaginationSchema } from "../../schemas/paginationSchemas"
import pool from "../../db/mysql"

export class ChatModel implements IChatModel {
    async getChats({input, id}: {input: PaginationSchema, id: UUID}): Promise<ChatMessage[]> {
        const { page, pageSize } = input
        const sql = `SELECT c.id AS id, c.create_at AS create_at, 
                    IF(f.primary_user_id = UUID_TO_BIN(?), uai2.photo, uai1.photo) AS photo, 
                    IF(f.primary_user_id = UUID_TO_BIN(?), 
                        IF(fc.primary_nickname IS NULL, ua2.username, fc.primary_nickname), 
                        IF(fc.secondary_nickname IS NULL, ua1.username, fc.secondary_nickname)
                    ) AS nickname,
                    'private' AS chat_type 
                    FROM friendship AS f JOIN friendship_chat AS fc ON fc.friendship_id = f.id JOIN chat AS c ON c.id = fc.chat_id
                    JOIN user_account AS ua1 ON f.primary_user_id = ua1.id JOIN user_account AS ua2 ON f.secondary_user_id = ua2.id 
                    LEFT JOIN user_account_info AS uai1 ON ua1.id = uai1.user_id LEFT JOIN user_account_info AS uai2 ON ua2.id = uai2.user_id
                    WHERE f.primary_user_id = UUID_TO_BIN(?) OR f.secondary_user_id = UUID_TO_BIN(?) LIMIT ?, ?`
        const [chats] = await pool.query(sql, [id,id,id,id,page,pageSize]) as QueryResult as [ChatMessage[]]
        return chats
    }

    async getChatById({idChat, id}: {idChat: number, id: UUID}): Promise<ChatMessage[]> {
        const sql = `SELECT c.id AS id, c.create_at AS create_at, 
                    IF(f.primary_user_id = UUID_TO_BIN(?), uai2.photo, uai1.photo) AS photo, 
                    IF(f.primary_user_id = UUID_TO_BIN(?), 
                        IF(fc.primary_nickname IS NULL, ua2.username, fc.primary_nickname), 
                        IF(fc.secondary_nickname IS NULL, ua1.username, fc.secondary_nickname)
                    ) AS nickname,
                    'private' AS chat_type 
                    FROM friendship AS f JOIN friendship_chat AS fc ON fc.friendship_id = f.id JOIN chat AS c ON c.id = fc.chat_id 
                    JOIN user_account AS ua1 ON f.primary_user_id = ua1.id JOIN user_account AS ua2 ON f.secondary_user_id = ua2.id 
                    LEFT JOIN user_account_info AS uai1 ON ua1.id = uai1.user_id LEFT JOIN user_account_info AS uai2 ON ua2.id = uai2.user_id 
                    WHERE (f.primary_user_id = UUID_TO_BIN(?) OR f.secondary_user_id = UUID_TO_BIN(?)) AND c.id = ?`
        const [chats] = await pool.query(sql, [id,id,id,id,idChat]) as QueryResult as [ChatMessage[]]
        return chats
    }

    async getChatsByName({input, id}: {input: PaginationNameSchema, id: UUID}): Promise<ChatMessage[]> {
        const { name, page, pageSize } = input
        const sql = `SELECT c.id AS id, c.create_at AS create_at, 
                    IF(f.primary_user_id = UUID_TO_BIN(?), uai2.photo, uai1.photo) AS photo, 
                    IF(f.primary_user_id = UUID_TO_BIN(?), 
                        IF(fc.primary_nickname IS NULL, ua2.username, fc.primary_nickname), 
                        IF(fc.secondary_nickname IS NULL, ua1.username, fc.secondary_nickname)
                    ) AS nickname,
                    'private' AS chat_type 
                    FROM friendship AS f JOIN friendship_chat AS fc ON fc.friendship_id = f.id JOIN chat AS c ON c.id = fc.chat_id
                    JOIN user_account AS ua1 ON f.primary_user_id = ua1.id JOIN user_account AS ua2 ON f.secondary_user_id = ua2.id 
                    LEFT JOIN user_account_info AS uai1 ON ua1.id = uai1.user_id LEFT JOIN user_account_info AS uai2 ON ua2.id = uai2.user_id
                    WHERE f.primary_user_id = UUID_TO_BIN(?) OR f.secondary_user_id = UUID_TO_BIN(?)
                    HAVING (nickname REGEXP ?) LIMIT ?, ?`
        const [chats] = await pool.query(sql, [id,id,id,id,name,page,pageSize]) as QueryResult as [ChatMessage[]]
        return chats
    }

    async createChat(conn?: PoolConnection): Promise<number> {
        const execute = conn ?? pool
        const [result] = await execute.query('INSERT INTO chat DEFAULT VALUES');
    
        return (result as ResultSetHeader).insertId;
    }

    async removeChat({id}: {id: number}, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        await execute.query('DELETE FROM chat WHERE id = ?', [id])
    }

    async getChatMembers(chatId: number): Promise<string[]> {
        const sql = `
            SELECT BIN_TO_UUID(primary_user_id) as member_id FROM friendship f JOIN friendship_chat fc ON f.id = fc.friendship_id WHERE fc.chat_id = ?
            UNION
            SELECT BIN_TO_UUID(secondary_user_id) as member_id FROM friendship f JOIN friendship_chat fc ON f.id = fc.friendship_id WHERE fc.chat_id = ?
            UNION
            SELECT BIN_TO_UUID(member_id) as member_id FROM group_members gm JOIN group_chat gc ON gm.group_chat_id = gc.id WHERE gc.chat_id = ?
        `;
        const [rows] = await pool.query(sql, [chatId, chatId, chatId]) as QueryResult as [Array<{member_id: string}>]
        return rows.map(r => r.member_id)
    }
}

export const chatModel = new ChatModel()