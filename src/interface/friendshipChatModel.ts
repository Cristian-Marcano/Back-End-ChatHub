import { UUID } from "node:crypto"
import { PoolConnection } from "mysql2/promise"
import { Chat } from "./chatModel"
import { UserInfo } from "./userInfoModel"
import { PaginationNameSchema, PaginationSchema } from "../schemas/paginationSchemas"
import { NicknamesPartialSchemas } from "../schemas/friendshipChatSchemas"

export type FriendshipChat = Pick<Chat, "id" | "create_at" | "nickname" | "photo"> & Pick<UserInfo, "about">

export interface IFriendshipChatModel {
    getFriendshipChats(params: {input: PaginationSchema, id: UUID}): Promise<FriendshipChat[]>

    getFriendshipChatsByName(params: {input: PaginationNameSchema, id: UUID}): Promise<FriendshipChat[]>

    createFriendshipChat(params: {idFriendship: number, idChat: number}, conn?: PoolConnection): Promise<void>

    updateFriendshipChat(params: {input: NicknamesPartialSchemas, id: number}, conn?: PoolConnection): Promise<void>

    removeFriendshipChat(params: {id: number}, conn?: PoolConnection): Promise<void>
}