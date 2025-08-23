import { UUID } from "node:crypto"
import { PoolConnection } from "mysql2/promise"
import { AddMemberSchema, CreateGroupSchema, LeaveGroupSchema } from "../schemas/groupSchemas"
import { ChatId } from "../schemas/messageSchemas"

export interface GroupChat {
    id: number
    nickname: string
    create_by: UUID
    chat_id: number
    add_user_permission: 'admin' | 'all'
}

export interface GroupMember {
    id: number
    member_id: UUID
    group_chat_id: number
    joined_at: Date
    role: 'member' | 'admin' | 'owner'
    full_name?: string
    photo?: string | null
}

export interface IGroupModel {
    // Retorna el ID del chat
    createGroup(params: {input: CreateGroupSchema, creatorId: UUID}, conn?: PoolConnection): Promise<number>
    
    addMember(params: {input: AddMemberSchema}, conn?: PoolConnection): Promise<void>
    
    removeMember(params: {input: LeaveGroupSchema, memberId: UUID}, conn?: PoolConnection): Promise<void>
    
    // Obtiene información general de los miembros de un grupo (para el cliente)
    getGroupMembers(params: {chatId: ChatId}): Promise<GroupMember[]>
    
    // Obtiene información de un grupo mediante el chatId
    getGroupByChatId(params: {chatId: ChatId}, conn?: PoolConnection): Promise<GroupChat | null>
    updateMemberRole(params: {chatId: number, memberId: UUID, role: 'member' | 'admin'}): Promise<void>
    updateGroupSettings(params: {chatId: number, add_user_permission: 'admin' | 'all'}): Promise<void>
}
