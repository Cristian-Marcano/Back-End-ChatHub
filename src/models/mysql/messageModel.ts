import { UUID } from "node:crypto"
import { PoolConnection, QueryResult } from "mysql2/promise"
import { IMessageModel, MessageUser, MessageViewUser } from "../../interface/messageModel"
import { ChatId, MessageId, MessageSchema, MessageViewSchema, MessageEditSchema, MessageDeleteSchema } from "../../schemas/messageSchemas"
import pool from "../../db/mysql"

class MessageModel implements IMessageModel {
    async getMessagesByChatId({chatId}: { chatId: ChatId }): Promise<MessageUser[]> {
        const sql = `SELECT m.id AS id, BIN_TO_UUID(user_sending_id) AS user_sending_id, chat_id, msg_text, create_at, update_at, censored, username, email 
                    FROM message AS m JOIN user_account AS ua ON m.user_sending_id = ua.id WHERE m.chat_id = ?`
        const [messages] = await pool.query(sql, [chatId]) as QueryResult as [MessageUser[]]
        return messages
    }

    async getMessageViewUser({messageId}: { messageId: MessageId }): Promise<MessageViewUser[]> {
        const sql = `SELECT mv.id AS id, BIN_TO_UUID(user_id) AS user_id, message_id, viewed_at, username, email
                    FROM message_view AS mv JOIN user_account AS ua ON mv.user_id = ua.id WHERE mv.message_id = ?`
        const [messagesView] = await pool.query(sql, [messageId]) as QueryResult as [MessageViewUser[]]
        return messagesView
    }

    async createMessage({input, id}: { input: MessageSchema, id: UUID }): Promise<MessageUser> {
        const { chatId, msgText } = input
        const [result] = await pool.query('INSERT INTO message(chat_id, msg_text, user_sending_id) VALUES (?,?,UUID_TO_BIN(?))', [chatId, msgText, id]) as any
        
        const sql = `SELECT m.id AS id, BIN_TO_UUID(user_sending_id) AS user_sending_id, chat_id, msg_text, create_at, update_at, censored, username, email 
                    FROM message AS m JOIN user_account AS ua ON m.user_sending_id = ua.id WHERE m.id = ?`
        const [messages] = await pool.query(sql, [result.insertId]) as QueryResult as [MessageUser[]]
        return messages[0]
    }

    async createMessageView({input}: { input: MessageViewSchema }): Promise<void> {
        const { userId, messageId } = input
        await pool.query('INSERT INTO message_view(user_id, message_id) VALUES (UUID_TO_BIN(?),?)', [userId, messageId])
    }

    async updateMessage({input, userId}: { input: MessageEditSchema, userId: UUID }, conn?: PoolConnection): Promise<void> {
        const { msgText, messageId } = input
        const execute = conn ?? pool
        // Ensure only the owner can edit the message
        await execute.query('UPDATE message SET msg_text = ?, update_at = NOW() WHERE id = ? AND user_sending_id = UUID_TO_BIN(?)', [msgText, messageId, userId])
    }

    async removeMessage({input, userId}: { input: MessageDeleteSchema, userId: UUID }, conn?: PoolConnection): Promise<void> {
        const { messageId } = input
        const execute = conn ?? pool
        // Ensure only the owner can delete the message
        await execute.query('DELETE FROM message WHERE id = ? AND user_sending_id = UUID_TO_BIN(?)', [messageId, userId])
    }
}

export const messageModel = new MessageModel()