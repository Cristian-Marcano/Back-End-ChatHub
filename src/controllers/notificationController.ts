import { Request, Response } from "express"
import { validateSubscribe, validateUnsubscribe } from "../schemas/pushSchemas"
import { NotificationService } from "../services/notificationService"

export class NotificationController {
    private notificationService: NotificationService

    constructor({ notificationService }: { notificationService: NotificationService }) {
        this.notificationService = notificationService
    }

    subscribe = async (req: Request, res: Response): Promise<void> => {
        const result = validateSubscribe(req.body)
        const userId = req.body.userPayload?.id

        if (!result.success) {
            res.status(422).json({ error: JSON.parse(result.error.message) })
            return
        }

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        try {
            await this.notificationService.saveSubscription(userId, result.data)
            res.status(201).json({ message: 'Subscription saved successfully.' })
        } catch (error: any) {
            res.status(500).json({ message: 'Server error saving subscription', error })
        }
    }

    unsubscribe = async (req: Request, res: Response): Promise<void> => {
        const result = validateUnsubscribe(req.body)
        const userId = req.body.userPayload?.id

        if (!result.success) {
            res.status(422).json({ error: JSON.parse(result.error.message) })
            return
        }

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        try {
            await this.notificationService.removeSubscription(userId, result.data)
            res.status(200).json({ message: 'Subscription removed successfully.' })
        } catch (error: any) {
            res.status(500).json({ message: 'Server error removing subscription', error })
        }
    }
}
