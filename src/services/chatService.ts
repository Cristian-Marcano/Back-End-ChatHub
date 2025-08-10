import { UUID } from "node:crypto"
import { IModels } from "../interface/models" 
import { withTransaction } from "../db/mysql/transaction"
import { IChatModel } from "../interface/chatModel"
import { PaginationSchema } from "../schemas/paginationSchemas"
import { ChatHistorySchema, ChatId, MessageSchema, MessageViewSchema, MessageEditSchema, MessageDeleteSchema, MessageSearchSchema, MessageContextSchema } from "../schemas/messageSchemas"
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

    async historyChat({ input }: {input: ChatHistorySchema}) {
        return await this.messageModel.getMessagesByChatId({ input })
    }

    async typingChat() {
        return true
    }

    async sendMessageChat({ input, id }: {input: MessageSchema, id: UUID}) {
        return await this.messageModel.createMessage({ input, id })
    }

    async readMessageChat({ input }: {input: MessageViewSchema }) {
        return await this.messageModel.createMessageView({ input })
    }

    async editMessageChat({ input, id }: {input: MessageEditSchema, id: UUID}) {
        return await this.messageModel.updateMessage({ input, userId: id })
    }

    async deleteMessageChat({ input, id }: {input: MessageDeleteSchema, id: UUID}) {
        return await this.messageModel.removeMessage({ input, userId: id })
    }

    
    async searchMessagesChat({ input }: {input: MessageSearchSchema}) {
        return await this.messageModel.searchMessages({ input })
    }

    async loadContextChat({ input }: {input: MessageContextSchema}) {
        return await this.messageModel.getMessageContext({ input })
    }

    async getChatMembers(chatId: number) {
        return await this.chatModel.getChatMembers(chatId)
    }

}