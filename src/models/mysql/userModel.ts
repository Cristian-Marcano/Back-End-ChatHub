import { QueryResult } from "mysql2"
import pool from "../../config/database"
import { IUserModel, User } from "../../interface/userModel"
import { UserSchema, UserPartialSchema } from "../../schemas/userSchemas"
import { UUID } from "node:crypto"

class UserModel implements IUserModel {
    async getUser({input}: {input: UserSchema}): Promise<User[]> {
        const { username, email } = input
        const [user] = await pool.query(`SELECT BIN_TO_UUID(id) AS id, username, email, keyword, create_at
                                            FROM user_account WHERE username = ? OR email = ?`, [username, email]) as QueryResult as [User[]]
        return user
    }

    async getAllUsers({input, id}: {input: UserSchema, id: string}): Promise<User[]> {
        const { username } = input
        if(username) {
            const [users] = await pool.query(`SELECT * FROM user_account AS ua JOIN user_account_info AS uai ON ua.id = uai.user_id
                                                WHERE ua.username REGEXP ? AND ua.id <> UUID_TO_BIN(?)`, [username, id]) as QueryResult as [User[]]
            return users
        }
        const [users] = await pool.query(`SELECT * FROM user_account AS ua JOIN user_account_info AS uai ON ua.id = uai.user_id
                                            WHERE ua.id <> UUID_TO_BIN(?)`, [id])  as QueryResult as [User[]]
        return users
    }

    async getUserByUsernameOrEmail({input}: {input: UserPartialSchema}): Promise<User[]> {
        const { username, email } = input
        if(username) {
            const [user] = await pool.query(`SELECT BIN_TO_UUID(id) AS id, username, email, keyword, create_at
                                                FROM user_account WHERE username = ?`, [username]) as QueryResult as [User[]]
            return user
        }
        const [user] = await pool.query(`SELECT BIN_TO_UUID(id) AS id, username, email, keyword, create_at
                                                FROM user_account WHERE email = ?`, [email]) as QueryResult as [User[]]
        return user
    }

    async getUserById({id}: {id: string}): Promise<User[]> {
        const [user] = await pool.query(`SELECT * FROM user_account AS ua JOIN user_account_info AS uai ON ua.id = uai.user_id 
                                            WHERE ua.id = UUID_TO_BIN(?)`, [id]) as QueryResult as [User[]]
        return user
    }

    async createUser({input}: {input: UserSchema}): Promise<void> {
        const {username, password, email} = input
        await pool.query(`INSERT INTO user_account(username, keyword, email) VALUE (?, ?, ?)`,[username, password, email])
    }

    async updateUser({input, id}: {input: User, id:UUID}): Promise<void> {
        await pool.query(`UPDATE user_account SET ? WHERE id = UUID_TO_BIN(?)`, [input, id])
    }
}

export const userModel = new UserModel()