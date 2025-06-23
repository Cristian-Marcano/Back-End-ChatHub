import { IModels } from "../interface/models"
import { ITempEmailsModel } from "../interface/tempEmailsModel"
import { IUserModel } from "../interface/userModel"
import { IPasswordResetsModel } from "../interface/passwordResetsModel"
import { IRefreshTokensModel } from "../interface/refreshTokensModel"
import { CodeEmailSchema } from "../schemas/codeEmailSchemas"
import { UserRefineSchema, UserSchema } from "../schemas/userSchemas"
import { ForgotPasswordSchema, ResetPasswordSchema, RefreshTokenSchema } from "../schemas/authSecuritySchemas"
import { genereteHashedPassword, validateHashedPassword } from "../utils/password"
import { assignToken, generateRandomToken } from "../utils/token"
import { mailTo } from "../utils/mailTo"
import crypto from "node:crypto"

export class AuthService {
    private userModel: IUserModel
    private tempEmailsModel: ITempEmailsModel
    private passwordResetsModel?: IPasswordResetsModel
    private refreshTokensModel?: IRefreshTokensModel

    constructor({userModel, tempEmailsModel, passwordResetsModel, refreshTokensModel}: IModels) {
        if(!userModel || !tempEmailsModel) 
            throw new Error('userModel and tempEmailModel are required in AuthService')

        this.userModel = userModel
        this.tempEmailsModel = tempEmailsModel
        this.passwordResetsModel = passwordResetsModel
        this.refreshTokensModel = refreshTokensModel
    }

    async registerTemporalEmail({input}: {input: UserSchema}) {
        const cod:number = Math.floor(100000 + Math.random() * 900000)
        
        const tempEmails = await this.tempEmailsModel.getTempEmail({input})

        if(tempEmails.length === 0) {
            await this.tempEmailsModel.createTempEmail({input, cod})
            await mailTo(input.email, 'Titulo de Codigo de autenticacion', `Se le adjunta el siguiente codigo para autenticarse en la API ${cod}`)
            return
        }

        const containTempEmail = tempEmails.filter((value)=> value.email === value.email).length > 0

        if(containTempEmail) {
            await this.tempEmailsModel.updateTempEmail({input, cod})
            await mailTo(input.email, 'Titulo de Codigo de autenticacion', `Se le adjunta el siguiente codigo para autenticarse en la API ${cod}`)
            return
        }
        
        throw new Error('USERNAME_EXIST')
    }

    async verifyUserExist({input}: {input: UserSchema}) {
        const existingUser = await this.userModel.getUser({input})

        if(existingUser.length > 0) {
            const isUsername = existingUser.filter((value) => value.username === input.username)
            throw new Error(isUsername.length > 0 ? 'USERNAME_EXISTS' : 'EMAIL_EXISTS')
        } 
    }

    async registerUser({input}: {input: UserSchema}) {
        const hashedPassword = await genereteHashedPassword(input.password)

        await this.userModel.createUser({
            input: { ...input, password: hashedPassword }
        })
    }

    async verifyCodeEmail({input}: {input: CodeEmailSchema}) {
        const tempEmail = await this.tempEmailsModel.getTempEmailByEmail({input})

        if(tempEmail.length === 0)
            throw new Error('EMAIL_NOT_FOUND')

        const { cod, email, username, keyword:password } = tempEmail[0]

        if(cod === input.code) {
            await this.tempEmailsModel.removeTempEmail({input})
            return { username, password, email }
        }

        throw new Error('CODE_INVALID')
    }

    async loginUser({input}: {input: UserRefineSchema}) {
        const user = await this.userModel.getUserByUsernameOrEmail({input})

        if(user.length === 0) throw new Error('INVALID_CREDENTIALS')

        const { keyword: hashedPassword, id } = user[0]

        const isValid = await validateHashedPassword(input.password, hashedPassword)

        if(!isValid) throw new Error('INVALID_CREDENTIALS')

        const token = assignToken({id})
        
        let refreshToken = null
        if(this.refreshTokensModel) {
            refreshToken = generateRandomToken()
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration
            await this.refreshTokensModel.createRefreshToken({userId: id, token: refreshToken, expiresAt})
        }

        return { token, refreshToken }
    }

    async forgotPassword({input}: {input: ForgotPasswordSchema}) {
        const user = await this.userModel.getUser({input: {email: input.email, username: '', password: ''}})
        
        if (user.length === 0) {
            return // Para no revelar si un email existe o no, simulamos que todo salio bien
        }

        if (this.passwordResetsModel) {
            const resetToken = crypto.randomBytes(32).toString('hex')
            const expiresAt = new Date()
            expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 mins validity
            
            await this.passwordResetsModel.createResetToken({ userId: user[0].id, token: resetToken, expiresAt })
            
            // En un sistema real, enviariamos una URL como `https://tudominio.com/reset-password?token=${resetToken}`
            await mailTo(input.email, 'Recuperacion de contraseña', `Tu codigo de recuperacion es: ${resetToken}`)
        }
    }

    async resetPassword({input}: {input: ResetPasswordSchema}) {
        if (!this.passwordResetsModel) throw new Error('Password reset not implemented')

        const tokens = await this.passwordResetsModel.getValidToken({token: input.token})
        
        if (tokens.length === 0) {
            throw new Error('INVALID_OR_EXPIRED_TOKEN')
        }

        const validToken = tokens[0]
        const hashedPassword = await genereteHashedPassword(input.newPassword)

        await this.userModel.updatePassword({ userId: validToken.user_id, newPassword: hashedPassword })
        await this.passwordResetsModel.deleteToken({ id: validToken.id })
    }

    async refreshToken({input}: {input: RefreshTokenSchema}) {
        if (!this.refreshTokensModel) throw new Error('Refresh tokens not implemented')
        
        const tokens = await this.refreshTokensModel.getValidToken({token: input.refreshToken})

        if (tokens.length === 0) {
            throw new Error('INVALID_REFRESH_TOKEN')
        }

        const validToken = tokens[0]
        const newToken = assignToken({id: validToken.user_id})

        return { token: newToken }
    }

    async logout({input}: {input: RefreshTokenSchema}) {
        if (this.refreshTokensModel) {
            await this.refreshTokensModel.revokeToken({token: input.refreshToken})
        }
    }
}
