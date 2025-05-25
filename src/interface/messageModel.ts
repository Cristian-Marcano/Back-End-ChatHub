import { UUID } from "node:crypto"
import { User } from "./userModel"
import { PoolConnection } from "mysql2/promise"
import { ChatId, MessageId, MessageSchema, MessageViewSchema } from "../schemas/messageSchemas"

export interface Message {
    id: number,
    user_sending_id: UUID,
    chat_id: number,
    msg_text: string,
    create_at: Date,
    update_at: Date|null,
    censored: boolean
}

export type MessageUser = Pick<User, "username" | "email"> & Message

export interface MessageView {
    id: number,
    user_id: UUID,
    message_id: number,
    viewed_at: Date
}

export type MessageViewUser = Pick<User, "username" | "email"> & MessageView

export interface IMessageModel {
    getMessagesByChatId(params: {chatId: ChatId}): Promise<MessageUser[]>

    getMessageViewUser(params: {messageId: MessageId}): Promise<MessageViewUser[]>

    createMessage(params: {input: MessageSchema}): Promise<void>

    createMessageView(params: {input: MessageViewSchema}): Promise<void>

    updateMessage(params: {input: MessageSchema, id: MessageId}, conn?: PoolConnection): Promise<void>

    removeMessage(params: {id: MessageId}, conn?: PoolConnection): Promise<void>
}