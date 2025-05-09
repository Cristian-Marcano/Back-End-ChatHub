import { Request, Response } from "express"
import { validateCodeEmail } from "../schemas/codeEmailSchemas"
import { validateUser, validateUserRefine, UserSchema } from "../schemas/userSchemas"
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
            const { token } = await this.authService.loginUser({input:resultUser.data})
            res.status(200).json({message: 'You are logged in', token})
        } catch(error:any) {
            if(error.message === 'INVALID_CREDENTIALS') {
                res.status(404).json({message: 'Username or Email or Password is invalid'})
            } else {
                res.status(500).json({message: 'Server error'})
            }
        }
    }
}