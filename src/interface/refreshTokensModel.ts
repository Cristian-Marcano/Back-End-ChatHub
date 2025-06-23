export interface IRefreshTokensModel {
    createRefreshToken(input: { userId: string, token: string, expiresAt: Date }): Promise<void>
    getValidToken(input: { token: string }): Promise<Array<{ id: number, user_id: string, token: string, expires_at: Date, revoked: boolean }>>
    revokeToken(input: { token: string }): Promise<void>
    revokeAllUserTokens(input: { userId: string }): Promise<void>
}
