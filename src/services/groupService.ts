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
            // Se crea el grupo y se devuelve el ID de la sala (chatId)
            const chatId = await this.groupModel.createGroup({ input, creatorId }, conn)
            
            // Si el creador adjuntó miembros iniciales, los iteramos y añadimos
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
        // En una app real, aquí se debería verificar si requesterId es Admin o Creador del grupo.
        // Para empezar, asumimos que cualquiera dentro del grupo puede añadir a otro.
        const groupInfo = await this.groupModel.getGroupByChatId({ chatId: input.chatId })
        if (!groupInfo) throw new Error("Group does not exist")
        
        await this.groupModel.addMember({ input })
        return groupInfo
    }

    async leaveGroup({ input, memberId }: {input: LeaveGroupSchema, memberId: UUID}) {
        await this.groupModel.removeMember({ input, memberId })
        return true
    }
}
