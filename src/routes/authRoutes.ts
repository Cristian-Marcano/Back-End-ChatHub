import { Router } from "express"
import { AuthService } from "../services/authService"
import { AuthController } from "../controllers/authController"
import { IModels } from "../interface/models"

export const createAuthRouter = ({userModel, tempEmailsModel}: IModels) => {
    const authRouter = Router()

    const authService = new AuthService({userModel, tempEmailsModel})
    const authController = new AuthController({authService})
    
    authRouter.get('/', (req, res) => {
        res.sendFile(process.cwd() + '/client/index.html')
    })
    authRouter.post('/login', authController.login)
    authRouter.post('/verify-email', authController.verifyEmail)
    authRouter.put('/signup', authController.signUp)

    return authRouter
}