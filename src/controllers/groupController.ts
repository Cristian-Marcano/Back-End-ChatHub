import { handleSocketError } from "../utils/socketErrorHandler"
import { Server, Socket } from "socket.io"
import { GroupService } from "../services/groupService"
import { validateAddMember, validateCreateGroup, validateLeaveGroup, validateKickMember, validateUpdateRole, validateUpdateSettings } from "../schemas/groupSchemas"

export class GroupController {
    private groupService: GroupService

    constructor({ groupService }: {groupService: GroupService}) {
        this.groupService = groupService
    }

    create = async(namespace: string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        const resultSchema = validateCreateGroup(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const chatId = await this.groupService.createGroupChat({input: resultSchema.data, creatorId: id})
            
            socket.join(chatId.toString())
            
            socket.emit(`${namespace}:created`, {
                message: 'Group created successfully', 
                chatId, 
                nickname: resultSchema.data.nickname 
            })
            
            if (resultSchema.data.members) {
                resultSchema.data.members.forEach((memberId: string) => {
                    io.to(memberId).emit(`${namespace}:addedToGroup`, { chatId, nickname: resultSchema.data.nickname })
                })
            }

        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }

    addMember = async(namespace: string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        const resultSchema = validateAddMember(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const groupInfo = await this.groupService.addMember({input: resultSchema.data, requesterId: id})
            
            io.to(resultSchema.data.chatId.toString()).emit(`${namespace}:memberAdded`, { 
                chatId: resultSchema.data.chatId,
                newMemberId: resultSchema.data.memberId
            })
            
            io.to(resultSchema.data.memberId).emit(`${namespace}:addedToGroup`, {
                chatId: resultSchema.data.chatId,
                nickname: groupInfo.nickname
            })

        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }

    leave = async(namespace: string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data
        const resultSchema = validateLeaveGroup(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            await this.groupService.leaveGroup({input: resultSchema.data, memberId: id})
            
            socket.leave(resultSchema.data.chatId.toString())
            socket.emit(`${namespace}:left`, { chatId: resultSchema.data.chatId })
            
            io.to(resultSchema.data.chatId.toString()).emit(`${namespace}:memberLeft`, {
                chatId: resultSchema.data.chatId,
                memberId: id
            })

        } catch(error:any) {
            handleSocketError(error, socket)
        }
    }

    getMembers = async(namespace: string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { chatId } = data;
        if (!chatId) return;

        try {
            const members = await this.groupService.getGroupMembers({ chatId });
            socket.emit(`${namespace}:membersList`, { chatId, members });
        } catch (error: any) {
            handleSocketError(error, socket);
        }
    }

    kickMember = async(namespace: string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data;
        const resultSchema = validateKickMember(data);

        if (!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)});
            return;
        }

        try {
            await this.groupService.kickMember({ chatId: resultSchema.data.chatId, requesterId: id, targetId: resultSchema.data.targetId as import('node:crypto').UUID });
            
            io.to(resultSchema.data.chatId.toString()).emit(`${namespace}:memberKicked`, {
                chatId: resultSchema.data.chatId,
                memberId: resultSchema.data.targetId
            });
            
            io.to(resultSchema.data.targetId).emit(`${namespace}:youWereKicked`, {
                chatId: resultSchema.data.chatId
            });
        } catch (error: any) {
            handleSocketError(error, socket);
        }
    }

    updateRole = async(namespace: string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data;
        const resultSchema = validateUpdateRole(data);

        if (!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)});
            return;
        }

        try {
            await this.groupService.updateMemberRole({ 
                chatId: resultSchema.data.chatId, 
                requesterId: id, 
                targetId: resultSchema.data.targetId as import('node:crypto').UUID,
                newRole: resultSchema.data.newRole
            });
            
            io.to(resultSchema.data.chatId.toString()).emit(`${namespace}:roleUpdated`, {
                chatId: resultSchema.data.chatId,
                memberId: resultSchema.data.targetId,
                role: resultSchema.data.newRole
            });
        } catch (error: any) {
            handleSocketError(error, socket);
        }
    }

    updateSettings = async(namespace: string, io: Server, socket: Socket, data: any): Promise<void> => {
        const { id } = socket.data;
        const resultSchema = validateUpdateSettings(data);

        if (!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)});
            return;
        }

        try {
            await this.groupService.updateGroupSettings({ 
                chatId: resultSchema.data.chatId, 
                requesterId: id, 
                add_user_permission: resultSchema.data.add_user_permission
            });
            
            io.to(resultSchema.data.chatId.toString()).emit(`${namespace}:settingsUpdated`, {
                chatId: resultSchema.data.chatId,
                add_user_permission: resultSchema.data.add_user_permission
            });
        } catch (error: any) {
            handleSocketError(error, socket);
        }
    }
}
