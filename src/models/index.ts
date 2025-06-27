import { IModels } from "../interface/models"

export async function getModels(): Promise<IModels> {
    const dbType = process.env.DB_TYPE ?? 'mysql'

    if (dbType === 'mysql') {
        // Usamos importación dinámica (await import) para que los drivers 
        // y pools de conexiones de bases de datos que no estamos usando 
        // no se ejecuten ni consuman memoria.
        const { userModel } = await import('./mysql/userModel')
        const { userInfoModel } = await import('./mysql/userInfoModel')
        const { tempEmailsModel } = await import('./mysql/tempEmailsModel')
        const { chatModel } = await import('./mysql/chatModel')
        const { messageModel } = await import('./mysql/messageModel')
        const { friendshipModel } = await import('./mysql/friendshipModel')
        const { friendshipChatModel } = await import('./mysql/friendshipChatModel')
        const { groupModel } = await import('./mysql/groupModel')
        const { passwordResetsModel } = await import('./mysql/passwordResetsModel')
        const { refreshTokensModel } = await import('./mysql/refreshTokensModel')
        const { pushSubscriptionsModel } = await import('./mysql/pushSubscriptionsModel')

        return {
            userModel,
            userInfoModel,
            tempEmailsModel,
            chatModel,
            messageModel,
            friendshipModel,
            friendshipChatModel,
            groupModel,
            passwordResetsModel,
            refreshTokensModel,
            pushSubscriptionsModel
        }
    }

    if (dbType === 'postgres') {
        throw new Error('Postgres models are not implemented yet')
    }

    if (dbType === 'mongo') {
        throw new Error('MongoDB models are not implemented yet')
    }

    throw new Error(`Unsupported DB_TYPE: ${dbType}`)
}
