import { UUID } from "crypto"
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

    getAllUsers(params: {input: UserSchema, id: string}): Promise<User[]>

    getUserById(params: {id: string}): Promise<User[]>

    getUserByUsernameOrEmail(params: {input: UserPartialSchema}): Promise<User[]>

    createUser(params: {input: UserSchema}): Promise<void>

    updateUser(params: {input: User, id:UUID}): Promise<void>
}