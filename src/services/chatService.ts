import { UUID } from "node:crypto"
import { IModels } from "../interface/models" 
import { withTransaction } from "../db/mysql/transaction"
import { IChatModel } from "../interface/chatModel"
import { PaginationSchema } from "../schemas/paginationSchemas"
import { ChatId, MessageSchema, MessageViewSchema} from "../schemas/messageSchemas"
import { IMessageModel } from "../interface/messageModel"

export class ChatService {
    private chatModel: IChatModel
    private messageModel: IMessageModel

    constructor({ chatModel, messageModel }: IModels) {
        if (!chatModel || !messageModel) 
            throw new Error(`
                    ${(!chatModel && !messageModel) ? 'chatModel' : 'chatModel'
                    } is required in chatModel
                `)
        
        this.chatModel = chatModel
        this.messageModel = messageModel

    }

    async getAllChat({ input, id }: {input: PaginationSchema, id:UUID}) {
        return await this.chatModel.getChats({ input, id })
    }

    async historyChat({ id }: {id: ChatId}) {
        return await this.messageModel.getMessagesByChatId({ chatId:id })
    }

    async typingChat() {
        return true
    }

    async sendMessageChat({ input }: {input: MessageSchema}) {
        return await this.messageModel.createMessage({ input })
    }

    async readMessageChat({ input }: {input: MessageViewSchema }) {
        return await this.messageModel.createMessageView({ input })
    }


}