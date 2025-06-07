import { UUID } from "node:crypto"
import { IModels } from "../interface/models" 
import { IFriendshipModel } from "../interface/friendshipModel" 
import { withTransaction } from "../db/mysql/transaction"
import { FriendshipShema, State, StateSchema, UserId } from "../schemas/friendshipSchemas" 
import { FriendshipChatSchema } from "../schemas/friendshipChatSchemas"
import { IUserInfoModel } from "../interface/userInfoModel"
import { IFriendshipChatModel } from "../interface/friendshipChatModel"
import { IChatModel } from "../interface/chatModel"

export class FriendshipService {
    private chatModel: IChatModel
    private userInfoModel: IUserInfoModel
    private friendshipModel: IFriendshipModel
    private friendshipChatModel: IFriendshipChatModel

    constructor({ chatModel, userInfoModel, friendshipModel, friendshipChatModel }: IModels) {
        if (!chatModel || !userInfoModel || !friendshipModel || !friendshipChatModel) 
            throw new Error(`
                    ${(!userInfoModel && !friendshipModel && !chatModel) ? 'userInfoModel, chatModel and friendshipModel': 
                        (!userInfoModel) ? 'userInfoModel' : 
                        (!chatModel) ? 'chatModel' : 'friendshipModel'
                    } is required in FriendshipService
                `)
        
        this.userInfoModel = userInfoModel
        this.friendshipModel = friendshipModel
        this.chatModel = chatModel
        this.friendshipChatModel = friendshipChatModel
    }

    async sentFriendship({ input }: {input: FriendshipShema}) {
        return await this.friendshipModel.createFriendship({ input })
    }

    async actionFriendship({ input, id }: {input: StateSchema, id:number}) {
        return await this.friendshipModel.updateFriendship({ input, id })
    }

    async acceptFriendship({ id }: {id: number}) {
        const input:StateSchema = { primary_state: 'accepted', secondary_state: 'accepted' }
        await this.friendshipModel.updateFriendship({ input, id })
        const chat_id:number = await this.chatModel.createChat()
        const inputChat:FriendshipChatSchema = {friendshipId: id, chatId: chat_id }

        return withTransaction(async(conn) => {
            await this.friendshipChatModel.createFriendshipChat({ input: inputChat }, conn)
        })
    }

    async rejectionFriendship({ id }: {id: number}) {
        const input:StateSchema = { primary_state: 'accepted', secondary_state: 'blocked' }
        return await this.friendshipModel.updateFriendship({ input, id })
    }

    async loadFriendships({ id }: { id: number}){
        return await this.friendshipModel.getFriendshipById({ id })
    }

    async requestFriendships({ state, id }: { state: State, id: UUID}){
        return await this.friendshipModel.getFriendshipsByUserId({ state, id })
    }

    async infoUserSecondary({ id }: {id: UserId}){
        return await this.userInfoModel.getUserInfoById({ id })
    }
}