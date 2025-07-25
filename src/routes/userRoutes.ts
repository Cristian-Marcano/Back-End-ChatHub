import { Router } from "express"
import { IModels } from "../interface/models"
import { UserService } from "../services/userService"
import { UserController } from "../controllers/userController"
import { validateAuthorization } from "../utils/token"

export const createUserRouter = (models: IModels) => {
    const userRouter = Router()

    const userService = new UserService(models)
    const userController = new UserController({ userService })

    userRouter.get('/info', validateAuthorization, userController.getInfoHttp)
    userRouter.put('/info', validateAuthorization, userController.upsertInfoHttp)
    userRouter.patch('/info', validateAuthorization, userController.patchInfoHttp)
    
    // Ruta para actualizar ajustes completos (user_account + user_account_info)
    userRouter.put('/settings', validateAuthorization, userController.updateSettingsHttp)

    return userRouter
}
