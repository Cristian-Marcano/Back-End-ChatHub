import { Request, Response } from "express"
import { validateCodeEmail } from "../schemas/codeEmailSchemas"
import { validateUser, validateUserRefine, UserSchema } from "../schemas/userSchemas"
import { validateForgotPassword, validateResetPassword, validateRefreshToken } from "../schemas/authSecuritySchemas"
import { AuthService } from "../services/authService"

export class AuthController { 
    private authService: AuthService

    constructor({authService}: {authService: AuthService}) {
        this.authService = authService
    }

    signUp = async(req:Request, res:Response): Promise<void> => {
        const resultUser = validateUser(req.body)

        if(!resultUser.success) {
            res.status(422).json({error: JSON.parse(resultUser.error.message)})
            return
        }

        try {
            await this.authService.verifyUserExist({input: resultUser.data})
            await this.authService.registerTemporalEmail({input: resultUser.data})

            res.status(201).json({message: 'Code sent to email'})
        } catch(error:any) {
            if(error.message === 'USERNAME_EXISTS') {
                res.status(404).json({ message: 'Username alredy exists' })
            } else if(error.message === 'EMAIL_EXISTS') {
                res.status(404).json({ message: 'Email alredy exists' })
            } else {
                res.status(500).json({message: 'Server error', error})
            }
        }
    }

    verifyEmail = async(req:Request, res:Response): Promise<void> => {
        const resultCode = validateCodeEmail(req.body)

        if(!resultCode.success) {
            res.status(422).json({error: JSON.parse(resultCode.error.message)})
            return
        }

        try {
            const user:UserSchema = await this.authService.verifyCodeEmail({input: resultCode.data})
            await this.authService.verifyUserExist({input: user})
            await this.authService.registerUser({input: user})

            res.status(201).json({message: 'User was created'})
        } catch(error: any) {
            if(error.message === 'EMAIL_NOT_FOUND') {
                res.status(404).json({message: 'Email not found'})
            } else if(error.message === 'CODE_INVALID') {
                res.status(404).json({message: 'Code invalid'})
            } else {
                res.status(500).json({message: 'Server error', error})
            }
        }
    }

    login = async(req:Request, res:Response): Promise<void> => {
        const resultUser = validateUserRefine(req.body)

        if(!resultUser.success) {
            res.status(422).json({error: JSON.parse(resultUser.error.message)})
            return
        }

        try {
            const { token, refreshToken } = await this.authService.loginUser({input:resultUser.data})
            res.status(200).json({message: 'You are logged in', token, refreshToken})
        } catch(error:any) {
            if(error.message === 'INVALID_CREDENTIALS') {
                res.status(404).json({message: 'Username or Email or Password is invalid'})
            } else {
                res.status(500).json({message: 'Server error'})
            }
        }
    }

    forgotPassword = async(req:Request, res:Response): Promise<void> => {
        const result = validateForgotPassword(req.body)
        
        if(!result.success) {
            res.status(422).json({error: JSON.parse(result.error.message)})
            return
        }

        try {
            await this.authService.forgotPassword({input: result.data})
            res.status(200).json({message: 'If the email exists, a recovery code was sent.'})
        } catch(error:any) {
            res.status(500).json({message: 'Server error'})
        }
    }

    resetPassword = async(req:Request, res:Response): Promise<void> => {
        const result = validateResetPassword(req.body)

        if(!result.success) {
            res.status(422).json({error: JSON.parse(result.error.message)})
            return
        }

        try {
            await this.authService.resetPassword({input: result.data})
            res.status(200).json({message: 'Password has been reset successfully'})
        } catch(error:any) {
            if (error.message === 'INVALID_OR_EXPIRED_TOKEN') {
                res.status(400).json({message: 'Token is invalid or has expired'})
            } else {
                res.status(500).json({message: 'Server error'})
            }
        }
    }

    refreshToken = async(req:Request, res:Response): Promise<void> => {
        const result = validateRefreshToken(req.body)

        if(!result.success) {
            res.status(422).json({error: JSON.parse(result.error.message)})
            return
        }

        try {
            const { token } = await this.authService.refreshToken({input: result.data})
            res.status(200).json({token})
        } catch(error:any) {
            if (error.message === 'INVALID_REFRESH_TOKEN') {
                res.status(401).json({message: 'Invalid or revoked refresh token'})
            } else {
                res.status(500).json({message: 'Server error'})
            }
        }
    }

    logout = async(req:Request, res:Response): Promise<void> => {
        const result = validateRefreshToken(req.body)

        if(!result.success) {
            res.status(422).json({error: JSON.parse(result.error.message)})
            return
        }

        try {
            await this.authService.logout({input: result.data})
            res.status(200).json({message: 'Logged out successfully'})
        } catch(error:any) {
            res.status(500).json({message: 'Server error'})
        }
    }
}
