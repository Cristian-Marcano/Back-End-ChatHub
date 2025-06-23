export interface IPasswordResetsModel {
    createResetToken(input: { userId: string, token: string, expiresAt: Date }): Promise<void>
    getValidToken(input: { token: string }): Promise<Array<{ id: number, user_id: string, reset_token: string, expires_at: Date }>>
    deleteToken(input: { id: number }): Promise<void>
}
