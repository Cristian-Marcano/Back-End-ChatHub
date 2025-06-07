import { UUID } from "node:crypto"
import { PoolConnection } from "mysql2/promise"
import { FriendshipShema, State, StateSchema, UserId } from "../schemas/friendshipSchemas"
import { User } from "./userModel"

export interface Friendship {
    id: number,
    primary_user_id: UUID,
    secondary_user_id: UUID,
    primary_state: string,
    secondary_state: string,
    create_at: Date,
    update_at: Date|null
}

type UserFriend = Pick<User, "username" | "email" | "create_at">

type PrimaryUserFriend = {
    [K in keyof UserFriend as `primary_user_${string & K}`]: UserFriend[K]
}

type SecondaryUserFriend = {
    [K in keyof UserFriend as `secondary_user_${string & K}`]: UserFriend[K]
}

export type FriendshipUser = UserFriend & Friendship & {
    user_create_at: Date
}

export type FriendshipGeneral = PrimaryUserFriend & SecondaryUserFriend & Friendship

export interface IFriendshipModel {
    getFriendshipById(params: {id: number}): Promise<FriendshipGeneral[]>

    getFriendshipsByUserId(params: {state: State, id: UUID | UserId}): Promise<FriendshipUser[]>

    createFriendship(params: {input: FriendshipShema}, conn?: PoolConnection): Promise<void>

    updateFriendship(params: {input: StateSchema, id: number}, conn?: PoolConnection): Promise<void>

    removeFriendship(params: {id: number}): Promise<void>
}