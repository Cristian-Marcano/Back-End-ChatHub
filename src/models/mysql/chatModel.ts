import { UUID } from "node:crypto"
import { ChatMessage, IChatModel } from "../../interface/chatModel"
import { PoolConnection, QueryResult } from "mysql2/promise"
import { PaginationNameSchema, PaginationSchema } from "../../schemas/paginationSchemas"
import pool from "../../db/mysql"

export class ChatModel implements IChatModel {
    async getChats({input, id}: {input: PaginationSchema, id: UUID}): Promise<ChatMessage[]> {
        const { page, pageSize } = input
        const sql = `SELECT c.id AS id, c.create_at AS create_at, IF(f.primary_user_id = UUID_TO_BIN(?), uai1.photo, uai2.photo) AS photo, IF(f.primary_user_id = UUID_TO_BIN(?), 
                    IF(fc.primary_nickname IS NULL, ua1.username, fc.primary_nickname), IF(fc.secondary_nickname IS NULL, ua2.username, fc.secondary_nickname)) AS nickname,
                    (SELECT user_sending_id, chat_id, msg_text, create_at AS msg_create_at, update_at AS msg_update_at, censored, username, email, FROM message AS m JOIN
                    user_account AS ua ON m.user_sending_id = ua.user_sending_id WHERE m.chat_id = c.id ORDER BY create_at DESC LIMIT 1) 'private' AS chat_type 
                    FROM friendship AS f JOIN friendship_chat AS fc ON fc.friendship_id = f.id JOIN chat AS c ON c.id = fc.chat_id
                    JOIN user_account AS ua1 ON f.primary_user_id = ua1.id JOIN user_account AS ua2 ON f.secondary_user_id = ua2.id 
                    JOIN user_account_info AS uai1 ON ua1.id = uai1.user_id JOIN user_account_info AS uai2 ON ua2.id = uai2.user_id
                    WHERE f.primary_user_id = UUID_TO_BIN(?) OR f.secondary_user_id = UUID_TO_BIN(?) LIMIT ?, ?`
        const [chats] = await pool.query(sql, [id,id,id,id,page,pageSize]) as QueryResult as [ChatMessage[]]
        return chats
    }

    async getChatById({idChat, id}: {idChat: number, id: UUID}): Promise<ChatMessage[]> {
        const sql = `SELECT c.id AS id, c.create_at AS create_at, IF(f.primary_user_id = UUID_TO_BIN(?), uai1.photo, uai2.photo) AS photo, IF(f.primary_user_id = UUID_TO_BIN(?), 
                    IF(fc.primary_nickname IS NULL, ua1.username, fc.primary_nickname), IF(fc.secondary_nickname IS NULL, ua2.username, fc.secondary_nickname)) AS nickname,
                    (SELECT user_sending_id, chat_id, msg_text, create_at AS msg_create_at, update_at AS msg_update_at, censored, username, email, FROM message AS m JOIN
                    user_account AS ua ON m.user_sending_id = ua.user_sending_id WHERE m.chat_id = c.id ORDER BY create_at DESC LIMIT 1) 'private' AS chat_type 
                    FROM friendship AS f JOIN friendship_chat AS fc ON fc.friendship_id = f.id JOIN chat AS c ON c.id = fc.chat_id 
                    JOIN user_account AS ua1 ON f.primary_user_id = ua1.id JOIN user_account AS ua2 ON f.secondary_user_id = ua2.id 
                    JOIN user_account_info AS uai1 ON ua1.id = uai1.user_id JOIN user_account_info AS uai2 ON ua2.id = uai2.user_id 
                    WHERE (f.primary_user_id = UUID_TO_BIN(?) OR f.secondary_user_id = UUID_TO_BIN(?)) AND id = ?`
        const [chats] = await pool.query(sql, [id,id,id,id,idChat]) as QueryResult as [ChatMessage[]]
        return chats
    }

    async getChatsByName({input, id}: {input: PaginationNameSchema, id: UUID}): Promise<ChatMessage[]> {
        const { name, page, pageSize } = input
        const sql = `SELECT c.id AS id, c.create_at AS create_at, IF(f.primary_user_id = UUID_TO_BIN(?), uai1.photo, uai2.photo) AS photo, IF(f.primary_user_id = UUID_TO_BIN(?), 
                    IF(fc.primary_nickname IS NULL, ua1.username, fc.primary_nickname), IF(fc.secondary_nickname IS NULL, ua2.username, fc.secondary_nickname)) AS nickname,
                    (SELECT user_sending_id, chat_id, msg_text, create_at AS msg_create_at, update_at AS msg_update_at, censored, username, email, FROM message AS m JOIN
                    user_account AS ua ON m.user_sending_id = ua.user_sending_id WHERE m.chat_id = c.id ORDER BY create_at DESC LIMIT 1) 'private' AS chat_type 
                    FROM friendship AS f JOIN friendship_chat AS fc ON fc.friendship_id = f.id JOIN chat AS c ON c.id = fc.chat_id
                    JOIN user_account AS ua1 ON f.primary_user_id = ua1.id JOIN user_account AS ua2 ON f.secondary_user_id = ua2.id 
                    JOIN user_account_info AS uai1 ON ua1.id = uai1.user_id JOIN user_account_info AS uai2 ON ua2.id = uai2.user_id
                    WHERE (f.primary_user_id = UUID_TO_BIN(?) OR f.secondary_user_id = UUID_TO_BIN(?)) AND nickname REGEXP ? LIMIT ?, ?`
        const [chats] = await pool.query(sql, [id,id,id,id,name,page,pageSize]) as QueryResult as [ChatMessage[]]
        return chats
    }

    async createChat(conn?: PoolConnection): Promise<number> {
        const execute = conn ?? pool
        const [result] = await execute.query('INSERT INTO chat DEFAULT VALUES');
    
        return (result as any).insertId;
    }

    async removeChat({id}: {id: number}, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        await execute.query('DELETE FROM chat WHERE id = ?', [id])
    }

}

export const chatModel = new ChatModel()