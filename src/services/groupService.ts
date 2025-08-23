import { UUID } from "node:crypto"
import { IModels } from "../interface/models"
import { IGroupModel } from "../interface/groupModel"
import { AddMemberSchema, CreateGroupSchema, LeaveGroupSchema } from "../schemas/groupSchemas"
import { withTransaction } from "../db/mysql/transaction"

export class GroupService {
    private groupModel: IGroupModel

    constructor({ groupModel }: IModels) {
        if (!groupModel) throw new Error("groupModel is required in GroupService")
        this.groupModel = groupModel
    }

    async createGroupChat({ input, creatorId }: {input: CreateGroupSchema, creatorId: UUID}) {
        return await withTransaction(async (conn) => {
            const chatId = await this.groupModel.createGroup({ input, creatorId }, conn)
            
            if (input.members && input.members.length > 0) {
                for (const memberId of input.members) {
                    await this.groupModel.addMember({ 
                        input: { chatId, memberId: memberId as UUID } 
                    }, conn)
                }
            }
            
            return chatId
        })
    }

    async addMember({ input, requesterId }: {input: AddMemberSchema, requesterId: UUID}) {
        const groupInfo = await this.groupModel.getGroupByChatId({ chatId: input.chatId })
        if (!groupInfo) throw new Error("Group does not exist")
        
        const members = await this.groupModel.getGroupMembers({ chatId: input.chatId });
        const requester = members.find(m => m.member_id === requesterId);
        
        if (!requester) throw new Error("Requester is not in the group");
        
        if (groupInfo.add_user_permission === 'admin' && requester.role === 'member') {
            throw new Error("Only admins can add users to this group");
        }
        
        await this.groupModel.addMember({ input })
        return groupInfo
    }

    async leaveGroup({ input, memberId }: {input: LeaveGroupSchema, memberId: UUID}) {
        await this.groupModel.removeMember({ input, memberId })
        return true
    }
    
    async getGroupMembers({ chatId }: {chatId: number}) {
        return await this.groupModel.getGroupMembers({ chatId });
    }
    
    async kickMember({ chatId, requesterId, targetId }: {chatId: number, requesterId: UUID, targetId: UUID}) {
        const members = await this.groupModel.getGroupMembers({ chatId });
        const requester = members.find(m => m.member_id === requesterId);
        const target = members.find(m => m.member_id === targetId);
        
        if (!requester || !target) throw new Error("User not in group");
        
        if (requester.role === 'member') throw new Error("Not authorized");
        if (target.role === 'owner') throw new Error("Cannot kick owner");
        if (requester.role === 'admin' && target.role === 'admin') throw new Error("Admin cannot kick another admin");
        
        await this.groupModel.removeMember({ input: { chatId }, memberId: targetId });
        return true;
    }
    
    async updateMemberRole({ chatId, requesterId, targetId, newRole }: {chatId: number, requesterId: UUID, targetId: UUID, newRole: 'member' | 'admin'}) {
        const members = await this.groupModel.getGroupMembers({ chatId });
        const requester = members.find(m => m.member_id === requesterId);
        
        if (!requester || requester.role !== 'owner') throw new Error("Only owner can change roles");
        
        await this.groupModel.updateMemberRole({ chatId, memberId: targetId, role: newRole });
        return true;
    }
    
    async updateGroupSettings({ chatId, requesterId, add_user_permission }: {chatId: number, requesterId: UUID, add_user_permission: 'admin' | 'all'}) {
        const members = await this.groupModel.getGroupMembers({ chatId });
        const requester = members.find(m => m.member_id === requesterId);
        
        if (!requester || requester.role === 'member') throw new Error("Only admins or owner can change settings");
        
        await this.groupModel.updateGroupSettings({ chatId, add_user_permission });
        return true;
    }
}
