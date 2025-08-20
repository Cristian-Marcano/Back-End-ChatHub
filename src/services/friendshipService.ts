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
        await this.friendshipModel.updateFriendship({ input, id })
        const [friendship] = await this.friendshipModel.getFriendshipById({ id })
        return friendship
    }

    async acceptFriendship({ id }: {id: number}) {
        const input:StateSchema = { primary_state: 'accepted', secondary_state: 'accepted' }
        await this.friendshipModel.updateFriendship({ input, id })
        const chat_id:number = await this.chatModel.createChat()
        const inputChat:FriendshipChatSchema = {friendshipId: id, chatId: chat_id }

        await withTransaction(async(conn) => {
            await this.friendshipChatModel.createFriendshipChat({ input: inputChat }, conn)
        })
        
        const [friendship] = await this.friendshipModel.getFriendshipById({ id })
        return friendship
    }

    async rejectionFriendship({ id }: {id: number}) {
        const input:StateSchema = { primary_state: 'accepted', secondary_state: 'blocked' }
        await this.friendshipModel.updateFriendship({ input, id })
        const [friendship] = await this.friendshipModel.getFriendshipById({ id })
        return friendship
    }

    async loadFriendships({ id }: { id: number}){
        return await this.friendshipModel.getFriendshipById({ id })
    }

    async requestFriendships({ state, id }: { state: State, id: UUID}){
        return await this.friendshipModel.getFriendshipsByUserId({ state, id })
    }

    
    async unblockUserByChatId({ chatId, userId }: {chatId: number, userId: UUID}) {
        const friendshipId = await this.friendshipChatModel.getFriendshipIdByChatId({ chatId });
        if (!friendshipId) throw new Error("Friendship not found for this chat");
        
        const [friendship] = await this.friendshipModel.getFriendshipById({ id: friendshipId });
        if (!friendship) throw new Error("Friendship not found");
        
        let primary_state = friendship.primary_state;
        let secondary_state = friendship.secondary_state;
        
        if (friendship.primary_user_id === userId && primary_state === 'blocked') {
            primary_state = 'accepted';
        } else if (friendship.secondary_user_id === userId && secondary_state === 'blocked') {
            secondary_state = 'accepted';
        }
        
        const input:StateSchema = { primary_state, secondary_state }
        await this.friendshipModel.updateFriendship({ input, id: friendshipId })
        const [updatedFriendship] = await this.friendshipModel.getFriendshipById({ id: friendshipId })
        return updatedFriendship
    }

    async blockUserByChatId({ chatId, userId }: {chatId: number, userId: UUID}) {
        const friendshipId = await this.friendshipChatModel.getFriendshipIdByChatId({ chatId });
        if (!friendshipId) throw new Error("Friendship not found for this chat");
        
        const [friendship] = await this.friendshipModel.getFriendshipById({ id: friendshipId });
        if (!friendship) throw new Error("Friendship not found");
        
        let primary_state = friendship.primary_state;
        let secondary_state = friendship.secondary_state;
        
        if (friendship.primary_user_id === userId) {
            primary_state = 'blocked';
        } else if (friendship.secondary_user_id === userId) {
            secondary_state = 'blocked';
        }
        
        const input:StateSchema = { primary_state, secondary_state }
        await this.friendshipModel.updateFriendship({ input, id: friendshipId })
        const [friendship] = await this.friendshipModel.getFriendshipById({ id: friendshipId })
        return friendship
    }


    async infoUserSecondary({ id }: {id: UserId}){
        return await this.userInfoModel.getUserInfoById({ id: id as UUID })
    }
}