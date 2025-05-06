import { UUID } from "node:crypto"
import { PoolConnection } from "mysql2/promise"
import { UserSchema, UserPartialSchema } from "../schemas/userSchemas"

export interface User {
    id: UUID,
    username: string,
    email: string,
    keyword: string,
    create_at: Date
}

export interface IUserModel {
    getUser(params: {input: UserSchema}): Promise<User[]>

    getAllUsers(params: {input: UserSchema, id: UUID}): Promise<User[]>

    getUserById(params: {id: UUID}): Promise<User[]>

    getUserByUsernameOrEmail(params: {input: UserPartialSchema}): Promise<User[]>

    createUser(params: {input: UserSchema}): Promise<void>

    updateUser(params: {input: User, id:UUID}, conn?: PoolConnection): Promise<void>
}