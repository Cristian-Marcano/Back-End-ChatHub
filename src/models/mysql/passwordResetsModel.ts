import { QueryResult } from "mysql2"
import pool from "../../db/mysql"
import { IPasswordResetsModel } from "../../interface/passwordResetsModel"

class PasswordResetsModel implements IPasswordResetsModel {
    async createResetToken(input: { userId: string, token: string, expiresAt: Date }): Promise<void> {
        const { userId, token, expiresAt } = input
        await pool.query('INSERT INTO password_resets(user_id, reset_token, expires_at) VALUES (UUID_TO_BIN(?), ?, ?)', [userId, token, expiresAt])
    }

    async getValidToken(input: { token: string }): Promise<Array<{ id: number, user_id: string, reset_token: string, expires_at: Date }>> {
        const { token } = input
        const [resets] = await pool.query(
            'SELECT id, BIN_TO_UUID(user_id) as user_id, reset_token, expires_at FROM password_resets WHERE reset_token = ? AND expires_at > NOW()',
            [token]
        ) as QueryResult as [Array<{ id: number, user_id: string, reset_token: string, expires_at: Date }>]
        return resets
    }

    async deleteToken(input: { id: number }): Promise<void> {
        const { id } = input
        await pool.query('DELETE FROM password_resets WHERE id = ?', [id])
    }
}

export const passwordResetsModel = new PasswordResetsModel()
