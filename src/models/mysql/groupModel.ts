import { UUID } from "node:crypto"
import { PoolConnection, QueryResult } from "mysql2/promise"
import { GroupChat, GroupMember, IGroupModel } from "../../interface/groupModel"
import { AddMemberSchema, CreateGroupSchema, LeaveGroupSchema } from "../../schemas/groupSchemas"
import { ChatId } from "../../schemas/messageSchemas"
import pool from "../../db/mysql"

class GroupModel implements IGroupModel {
    async createGroup({input, creatorId}: {input: CreateGroupSchema, creatorId: UUID}, conn?: PoolConnection): Promise<number> {
        const execute = conn ?? pool
        const { nickname } = input
        
        // El insert en 'chat' se asume que se hace desde chatModel, pero lo hacemos aquí si queremos todo transaccional.
        // O podemos inyectar el chatModel. Para simplificar, insertamos directamente en la tabla chat.
        const [chatResult] = await execute.query('INSERT INTO chat() VALUES()') as any
        const chatId = chatResult.insertId
        
        // Creamos el grupo
        const [groupResult] = await execute.query(
            'INSERT INTO group_chat(nickname, create_by, chat_id) VALUES (?, UUID_TO_BIN(?), ?)', 
            [nickname, creatorId, chatId]
        ) as any
        const groupChatId = groupResult.insertId
        
        // Añadimos al creador como primer miembro
        await execute.query(
            'INSERT INTO group_members(member_id, group_chat_id) VALUES (UUID_TO_BIN(?), ?)',
            [creatorId, groupChatId]
        )
        
        return chatId
    }

    async addMember({input}: {input: AddMemberSchema}, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        const { chatId, memberId } = input
        
        // Obtenemos el group_chat_id a partir del chat_id
        const groupChat = await this.getGroupByChatId({chatId})
        if (!groupChat) throw new Error('Group chat not found')
        
        await execute.query(
            'INSERT INTO group_members(member_id, group_chat_id) VALUES (UUID_TO_BIN(?), ?)',
            [memberId, groupChat.id]
        )
    }

    async removeMember({input, memberId}: {input: LeaveGroupSchema, memberId: UUID}, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        const { chatId } = input
        
        const groupChat = await this.getGroupByChatId({chatId})
        if (!groupChat) throw new Error('Group chat not found')
        
        await execute.query(
            'DELETE FROM group_members WHERE member_id = UUID_TO_BIN(?) AND group_chat_id = ?',
            [memberId, groupChat.id]
        )
    }

    async getGroupMembers({chatId}: {chatId: ChatId}): Promise<GroupMember[]> {
        const groupChat = await this.getGroupByChatId({chatId})
        if (!groupChat) return []
        
        const sql = `SELECT id, BIN_TO_UUID(member_id) AS member_id, group_chat_id, joined_at 
                     FROM group_members WHERE group_chat_id = ?`
        const [members] = await pool.query(sql, [groupChat.id]) as QueryResult as [GroupMember[]]
        return members
    }

    async getGroupByChatId({chatId}: {chatId: ChatId}): Promise<GroupChat | null> {
        const sql = `SELECT id, nickname, BIN_TO_UUID(create_by) AS create_by, chat_id 
                     FROM group_chat WHERE chat_id = ?`
        const [groups] = await pool.query(sql, [chatId]) as QueryResult as [GroupChat[]]
        if (groups.length === 0) return null
        return groups[0]
    }
}

export const groupModel = new GroupModel()
