import { Server, Socket } from "socket.io"
import { GroupService } from "../services/groupService"
import { validateAddMember, validateCreateGroup, validateLeaveGroup } from "../schemas/groupSchemas"

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
            
            // El creador se une automáticamente a la sala de este nuevo grupo
            socket.join(chatId.toString())
            
            socket.emit(`${namespace}:created`, {
                message: 'Group created successfully', 
                chatId, 
                nickname: resultSchema.data.nickname 
            })
            
            // Notificamos a los miembros iniciales para que se unan (si los hubo)
            if (resultSchema.data.members) {
                resultSchema.data.members.forEach((memberId: string) => {
                    io.to(memberId).emit(`${namespace}:addedToGroup`, { chatId, nickname: resultSchema.data.nickname })
                })
            }

        } catch(error:any) {
            socket.emit('error:server', {message: 'Error creating group'})
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
            
            // Avisar al grupo entero que se unió alguien nuevo
            io.to(resultSchema.data.chatId.toString()).emit(`${namespace}:memberAdded`, { 
                chatId: resultSchema.data.chatId,
                newMemberId: resultSchema.data.memberId
            })
            
            // Avisar directamente al usuario agregado para que su cliente haga un socket.join(chatId)
            io.to(resultSchema.data.memberId).emit(`${namespace}:addedToGroup`, {
                chatId: resultSchema.data.chatId,
                nickname: groupInfo.nickname
            })

        } catch(error:any) {
            socket.emit('error:server', {message: 'Error adding member to group'})
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
            
            // Sacamos el socket de la sala
            socket.leave(resultSchema.data.chatId.toString())
            socket.emit(`${namespace}:left`, { chatId: resultSchema.data.chatId })
            
            // Avisar al grupo que el usuario salió
            io.to(resultSchema.data.chatId.toString()).emit(`${namespace}:memberLeft`, {
                chatId: resultSchema.data.chatId,
                memberId: id
            })

        } catch(error:any) {
            socket.emit('error:server', {message: 'Error leaving group'})
        }
    }
}
