import { UUID } from "node:crypto"
import { PoolConnection, QueryResult, ResultSetHeader } from "mysql2/promise"
import { GroupChat, GroupMember, IGroupModel } from "../../interface/groupModel"
import { AddMemberSchema, CreateGroupSchema, LeaveGroupSchema } from "../../schemas/groupSchemas"
import { ChatId } from "../../schemas/messageSchemas"
import pool from "../../db/mysql"

class GroupModel implements IGroupModel {
    async createGroup({input, creatorId}: {input: CreateGroupSchema, creatorId: UUID}, conn?: PoolConnection): Promise<number> {
        const execute = conn ?? pool
        const { nickname } = input
        
        const [chatResult] = await execute.query('INSERT INTO chat() VALUES()') as [ResultSetHeader, any]
        const chatId = chatResult.insertId
        
        const [groupResult] = await execute.query(
            'INSERT INTO group_chat(nickname, create_by, chat_id) VALUES (?, UUID_TO_BIN(?), ?)', 
            [nickname, creatorId, chatId]
        ) as [ResultSetHeader, any]
        const groupChatId = groupResult.insertId
        
        // Add creator as owner
        await execute.query(
            'INSERT INTO group_members(member_id, group_chat_id, role) VALUES (UUID_TO_BIN(?), ?, ?)',
            [creatorId, groupChatId, 'owner']
        )
        
        return chatId
    }

    async addMember({input}: {input: AddMemberSchema}, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        const { chatId, memberId } = input
        
        const groupChat = await this.getGroupByChatId({chatId}, conn)
        if (!groupChat) throw new Error('Group chat not found')
        
        await execute.query(
            'INSERT INTO group_members(member_id, group_chat_id, role) VALUES (UUID_TO_BIN(?), ?, ?)',
            [memberId, groupChat.id, 'member']
        )
    }

    async removeMember({input, memberId}: {input: LeaveGroupSchema, memberId: UUID}, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        const { chatId } = input
        
        const groupChat = await this.getGroupByChatId({chatId}, conn)
        if (!groupChat) throw new Error('Group chat not found')
        
        await execute.query(
            'DELETE FROM group_members WHERE member_id = UUID_TO_BIN(?) AND group_chat_id = ?',
            [memberId, groupChat.id]
        )
    }

    async getGroupMembers({chatId}: {chatId: ChatId}): Promise<GroupMember[]> {
        const groupChat = await this.getGroupByChatId({chatId})
        if (!groupChat) return []
        
        const sql = `SELECT gm.id, BIN_TO_UUID(gm.member_id) AS member_id, gm.group_chat_id, gm.joined_at, gm.role, uai.full_name, uai.photo 
                     FROM group_members gm 
                     JOIN user_account_info uai ON uai.user_id = gm.member_id 
                     WHERE gm.group_chat_id = ? 
                     ORDER BY gm.role = 'owner' DESC, gm.role = 'admin' DESC, uai.full_name ASC`
        const [members] = await pool.query(sql, [groupChat.id]) as QueryResult as [GroupMember[]]
        return members
    }

    async getGroupByChatId({chatId}: {chatId: ChatId}, conn?: PoolConnection): Promise<GroupChat | null> {
        const execute = conn ?? pool;
        const sql = `SELECT id, nickname, BIN_TO_UUID(create_by) AS create_by, chat_id, add_user_permission 
                     FROM group_chat WHERE chat_id = ?`
        const [groups] = await execute.query(sql, [chatId]) as QueryResult as [GroupChat[]]
        if (groups.length === 0) return null
        return groups[0]
    }

    async updateMemberRole({chatId, memberId, role}: {chatId: number, memberId: UUID, role: 'member' | 'admin'}): Promise<void> {
        const groupChat = await this.getGroupByChatId({chatId})
        if (!groupChat) throw new Error('Group chat not found')
        
        await pool.query(
            'UPDATE group_members SET role = ? WHERE member_id = UUID_TO_BIN(?) AND group_chat_id = ? AND role != "owner"',
            [role, memberId, groupChat.id]
        )
    }

    async updateGroupSettings({chatId, add_user_permission}: {chatId: number, add_user_permission: 'admin' | 'all'}): Promise<void> {
        await pool.query(
            'UPDATE group_chat SET add_user_permission = ? WHERE chat_id = ?',
            [add_user_permission, chatId]
        )
    }
}

export const groupModel = new GroupModel()
