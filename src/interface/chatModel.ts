import { UUID } from "node:crypto"
import { PoolConnection } from "mysql2/promise"
import { MessageUser } from "./messageModel"
import { PaginationNameSchema, PaginationSchema } from "../schemas/paginationSchemas"

export interface Chat {
    id: number,
    create_at: Date
    nickname: string,
    photo: string|null
    chat_type: 'private'|'group'
}

export type ChatMessage = Pick<MessageUser, "user_sending_id" | "msg_text" | "censored" | "username" | "email"> & Chat & {
    msg_create_at: Date,
    msg_update_at: Date|null
}

export interface IChatModel {
    getChats(params: {input: PaginationSchema, id: UUID}): Promise<ChatMessage[]>

    getChatById(params: {idChat: number, id: UUID}): Promise<ChatMessage[]>

    getChatsByName(params: {input: PaginationNameSchema}): Promise<ChatMessage[]>

    createChat(conn?: PoolConnection): Promise<void>

    removeChat(params: {id: number}, conn?: PoolConnection): Promise<void>
}