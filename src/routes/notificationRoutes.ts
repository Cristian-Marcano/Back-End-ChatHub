import { Router } from "express"
import { IModels } from "../interface/models"
import { NotificationService } from "../services/notificationService"
import { NotificationController } from "../controllers/notificationController"
import { validateAuthorization } from "../utils/token"

export const createNotificationRouter = (models: IModels) => {
    const notificationRouter = Router()

    const notificationService = new NotificationService(models)
    const notificationController = new NotificationController({ notificationService })

    notificationRouter.post('/subscribe', validateAuthorization, notificationController.subscribe)
    notificationRouter.delete('/unsubscribe', validateAuthorization, notificationController.unsubscribe)

    return notificationRouter
}
