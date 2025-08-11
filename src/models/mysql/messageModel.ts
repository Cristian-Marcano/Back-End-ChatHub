import { UUID } from "node:crypto"
import { PoolConnection, QueryResult, ResultSetHeader } from "mysql2/promise"
import { IMessageModel, MessageUser, MessageViewUser } from "../../interface/messageModel"
import { ChatId, MessageId, MessageSchema, MessageViewSchema, MessageEditSchema, ChatHistorySchema, MessageDeleteSchema, MessageSearchSchema, MessageContextSchema } from "../../schemas/messageSchemas"
import pool from "../../db/mysql"

class MessageModel implements IMessageModel {
    async getMessagesByChatId({input}: { input: ChatHistorySchema }): Promise<MessageUser[]> {
        const { chatId, page, limit } = input
        const sql = `SELECT * FROM (
            SELECT m.id AS id, BIN_TO_UUID(m.user_sending_id) AS user_sending_id, m.chat_id, m.msg_text, m.create_at, m.update_at, m.censored, ua.username, ua.email, IF(mv.id IS NOT NULL, 'read', 'sent') AS status 
            FROM message AS m 
            JOIN user_account AS ua ON m.user_sending_id = ua.id 
            LEFT JOIN message_view AS mv ON mv.message_id = m.id AND mv.user_id != m.user_sending_id
            WHERE m.chat_id = ? 
            ORDER BY m.create_at DESC LIMIT ?, ?
        ) AS sub ORDER BY create_at ASC`
        const [messages] = await pool.query(sql, [chatId, (page - 1) * limit, limit]) as QueryResult as [MessageUser[]]
        return messages
    }

    async getMessageViewUser({messageId}: { messageId: MessageId }): Promise<MessageViewUser[]> {
        const sql = `SELECT mv.id AS id, BIN_TO_UUID(user_id) AS user_id, mv.message_id, mv.viewed_at, ua.username, ua.email
                    FROM message_view AS mv JOIN user_account AS ua ON mv.user_id = ua.id WHERE mv.message_id = ?`
        const [messagesView] = await pool.query(sql, [messageId]) as QueryResult as [MessageViewUser[]]
        return messagesView
    }

    async createMessage({input, id}: { input: MessageSchema, id: UUID }): Promise<MessageUser> {
        const { chatId, msgText } = input
        const [result] = await pool.query('INSERT INTO message(chat_id, msg_text, user_sending_id) VALUES (?,?,UUID_TO_BIN(?))', [chatId, msgText, id]) as [ResultSetHeader, any]
        
        const sql = `SELECT m.id AS id, BIN_TO_UUID(user_sending_id) AS user_sending_id, m.chat_id, m.msg_text, m.create_at, m.update_at, m.censored, ua.username, ua.email 
                    FROM message AS m JOIN user_account AS ua ON m.user_sending_id = ua.id WHERE m.id = ?`
        const [messages] = await pool.query(sql, [result.insertId]) as QueryResult as [MessageUser[]]
        return messages[0]
    }

    async createMessageView({input}: { input: MessageViewSchema }): Promise<void> {
        const { userId, messageId } = input
        await pool.query('INSERT INTO message_view(user_id, message_id) VALUES (UUID_TO_BIN(?),?)', [userId, messageId])
    }

    
    async markChatAsRead({chatId, userId}: { chatId: number, userId: UUID }): Promise<void> {
        // Insert ignores duplicates. Marks all unread messages sent by OTHER people in this chat as read by me.
        const sql = `
            INSERT IGNORE INTO message_view (user_id, message_id)
            SELECT UUID_TO_BIN(?), id FROM message 
            WHERE chat_id = ? AND user_sending_id != UUID_TO_BIN(?)
        `;
        await pool.query(sql, [userId, chatId, userId])
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

    async searchMessages({input}: {input: MessageSearchSchema}): Promise<MessageUser[]> {
        const { chatId, query, page, limit } = input
        const sql = `SELECT m.id AS id, BIN_TO_UUID(m.user_sending_id) AS user_sending_id, m.chat_id, m.msg_text, m.create_at, m.update_at, m.censored, ua.username, ua.email, IF(mv.id IS NOT NULL, 'read', 'sent') AS status
                    FROM message AS m 
                    JOIN user_account AS ua ON m.user_sending_id = ua.id 
                    LEFT JOIN message_view AS mv ON mv.message_id = m.id AND mv.user_id != m.user_sending_id
                    WHERE m.chat_id = ? AND m.msg_text LIKE ? 
                    ORDER BY m.create_at DESC LIMIT ?, ?`
        const [messages] = await pool.query(sql, [chatId, `%${query}%`, (page - 1) * limit, limit]) as QueryResult as [MessageUser[]]
        return messages
    }

    async getMessageContext({input}: {input: MessageContextSchema}): Promise<MessageUser[]> {
        const { chatId, targetMessageId } = input
        
        // This query fetches up to 15 previous messages, the target message, and up to 15 next messages
        // using a UNION of three queries.
        const sql = `(
            SELECT m.id AS id, BIN_TO_UUID(m.user_sending_id) AS user_sending_id, m.chat_id, m.msg_text, m.create_at, m.update_at, m.censored, ua.username, ua.email, IF(mv.id IS NOT NULL, 'read', 'sent') AS status
            FROM message AS m 
            JOIN user_account AS ua ON m.user_sending_id = ua.id 
            LEFT JOIN message_view AS mv ON mv.message_id = m.id AND mv.user_id != m.user_sending_id 
            WHERE m.chat_id = ? AND m.id < ? 
            ORDER BY m.id DESC LIMIT 15
        )
        UNION
        (
            SELECT m.id AS id, BIN_TO_UUID(m.user_sending_id) AS user_sending_id, m.chat_id, m.msg_text, m.create_at, m.update_at, m.censored, ua.username, ua.email, IF(mv.id IS NOT NULL, 'read', 'sent') AS status
            FROM message AS m 
            JOIN user_account AS ua ON m.user_sending_id = ua.id 
            LEFT JOIN message_view AS mv ON mv.message_id = m.id AND mv.user_id != m.user_sending_id 
            WHERE m.id = ?
        )
        UNION
        (
            SELECT m.id AS id, BIN_TO_UUID(m.user_sending_id) AS user_sending_id, m.chat_id, m.msg_text, m.create_at, m.update_at, m.censored, ua.username, ua.email, IF(mv.id IS NOT NULL, 'read', 'sent') AS status
            FROM message AS m 
            JOIN user_account AS ua ON m.user_sending_id = ua.id 
            LEFT JOIN message_view AS mv ON mv.message_id = m.id AND mv.user_id != m.user_sending_id 
            WHERE m.chat_id = ? AND m.id > ? 
            ORDER BY m.id ASC LIMIT 15
        )
        ORDER BY id ASC`
        
        const [messages] = await pool.query(sql, [chatId, targetMessageId, targetMessageId, chatId, targetMessageId]) as QueryResult as [MessageUser[]]
        return messages
    }

}

export const messageModel = new MessageModel()