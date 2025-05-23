import { UUID } from "node:crypto"
import { PoolConnection, QueryResult } from "mysql2/promise"
import { IMessageModel, MessageUser, MessageViewUser } from "../../interface/messageModel"
import { ChatId, MessageId, MessageSchema, MessageViewSchema } from "../../schemas/messageSchemas"
import pool from "../../db/mysql"

class MessageModel implements IMessageModel {
    async getMessagesByChatId({chatId}: { chatId: ChatId }): Promise<MessageUser[]> {
        const sql = `SELECT m.id AS id, user_sending_id, chat_id, msg_text, create_at, update_at, censored, username, email 
                    FROM message AS m JOIN user_account AS ua ON m.user_sending_id = ua.id WHERE m.chat_id = ?`
        const [messages] = await pool.query(sql, [chatId]) as QueryResult as [MessageUser[]]
        return messages
    }

    async getMessageViewUser({messageId}: { messageId: MessageId }): Promise<MessageViewUser[]> {
        const sql = `SELECT mv.id AS id, user_id, message_id, viewed_at, username, email
                    FROM message_view AS mv JOIN user_account AS ua ON mv.user_id = ua.id WHERE mv.message_id = ?`
        const [messagesView] = await pool.query(sql, [messageId]) as QueryResult as [MessageViewUser[]]
        return messagesView
    }

    async createMessage({input, id}: { input: MessageSchema, id: UUID }): Promise<void> {
        const { chatId, msgText } = input
        await pool.query('INSERT INTO message(chat_id, msg_text, user_sending_id) VALUES (?,?,?)', [chatId, msgText, id])
    }

    async createMessageView({input}: { input: MessageViewSchema }): Promise<void> {
        const { userId, messageId } = input
        await pool.query('INSERT INTO message_view(user_id, message_id) VALUES (?,?)', [userId, messageId])
    }

    async updateMessage({input, id}: { input: MessageSchema, id: MessageId }, conn?: PoolConnection): Promise<void> {
        const { msgText } = input
        const execute = conn ?? pool
        await execute.query('UPDATE message SET msg_text = ? WHERE id = ?', [msgText, id])
    }

    async removeMessage({id}: { id: MessageId }, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        await execute.query('DELETE FROM message WHERE id = ?', [id])
    }
}

export const messageModel = new MessageModel()