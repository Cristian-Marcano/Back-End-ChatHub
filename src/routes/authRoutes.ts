import { Router } from "express"
import { AuthService } from "../services/authService"
import { AuthController } from "../controllers/authController"
import { IModels } from "../interface/models"
import { authLimiter } from "../middlewares/rateLimiter"

export const createAuthRouter = ({userModel, tempEmailsModel, passwordResetsModel, refreshTokensModel}: IModels) => {
    const authRouter = Router()

    const authService = new AuthService({userModel, tempEmailsModel, passwordResetsModel, refreshTokensModel})
    const authController = new AuthController({authService})
    
    authRouter.get('/', (req, res) => {
        res.sendFile(process.cwd() + '/client/index.html')
    })
    
    // Rutas protegidas con authLimiter (estricto)
    authRouter.post('/login', authLimiter, authController.login)
    authRouter.post('/verify-email', authLimiter, authController.verifyEmail)
    authRouter.put('/signup', authLimiter, authController.signUp)
    authRouter.post('/forgot-password', authLimiter, authController.forgotPassword)
    
    // Rutas con límite global heredado
    authRouter.post('/reset-password', authController.resetPassword)
    authRouter.post('/refresh-token', authController.refreshToken)
    authRouter.post('/logout', authController.logout)

    return authRouter
}
