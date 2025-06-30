import { Router } from "express"
import { IModels } from "../interface/models"
import { UserService } from "../services/userService"
import { UserController } from "../controllers/userController"
import { validateAuthorization } from "../utils/token"

export const createUserRouter = (models: IModels) => {
    const userRouter = Router()

    const userService = new UserService(models)
    const userController = new UserController({ userService })

    userRouter.put('/info', validateAuthorization, userController.upsertInfoHttp)
    userRouter.patch('/info', validateAuthorization, userController.patchInfoHttp)

    return userRouter
}
