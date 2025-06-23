import { QueryResult } from "mysql2"
import pool from "../../db/mysql"
import { IRefreshTokensModel } from "../../interface/refreshTokensModel"

class RefreshTokensModel implements IRefreshTokensModel {
    async createRefreshToken(input: { userId: string, token: string, expiresAt: Date }): Promise<void> {
        const { userId, token, expiresAt } = input
        await pool.query('INSERT INTO refresh_tokens(user_id, token, expires_at) VALUES (UUID_TO_BIN(?), ?, ?)', [userId, token, expiresAt])
    }

    async getValidToken(input: { token: string }): Promise<Array<{ id: number, user_id: string, token: string, expires_at: Date, revoked: boolean }>> {
        const { token } = input
        const [tokens] = await pool.query(
            'SELECT id, BIN_TO_UUID(user_id) as user_id, token, expires_at, revoked FROM refresh_tokens WHERE token = ? AND expires_at > NOW() AND revoked = 0',
            [token]
        ) as QueryResult as [Array<{ id: number, user_id: string, token: string, expires_at: Date, revoked: boolean }>]
        return tokens
    }

    async revokeToken(input: { token: string }): Promise<void> {
        const { token } = input
        await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?', [token])
    }

    async revokeAllUserTokens(input: { userId: string }): Promise<void> {
        const { userId } = input
        await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = UUID_TO_BIN(?)', [userId])
    }
}

export const refreshTokensModel = new RefreshTokensModel()
