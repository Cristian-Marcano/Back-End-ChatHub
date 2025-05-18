import { UUID } from "node:crypto"
import { IModels } from "../interface/models" 
import { IFriendshipModel } from "../interface/friendshipModel" 
import { withTransaction } from "../db/mysql/transaction"
import { FriendshipShema, State } from "../schemas/friendshipSchemas" 

export class FriendshipService {
    private friendshipModel: IFriendshipModel

    constructor({ friendshipModel }: IModels) {
        if (!friendshipModel) {
            throw new Error('friendshipModel is required in friendshipModel');
        }
        
        this.friendshipModel = friendshipModel;
    }

    async sent({ input }: {input: FriendshipShema}) {
        return this.friendshipModel.createFriendship({ input });
    }

    async accept({ input, id }: {input: State, id: number}){
        return this.friendshipModel.updateFriendshipSecondaryState({ input, id })
    }

    
}