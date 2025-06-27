import webpush from 'web-push'
import { IModels } from "../interface/models"
import { IPushSubscriptionsModel, IPushSubscription } from "../interface/pushSubscriptionsModel"
import { SubscribeSchema, UnsubscribeSchema } from "../schemas/pushSchemas"

const PUBLIC_VAPID_KEY = process.env.PUBLIC_VAPID_KEY || ''
const PRIVATE_VAPID_KEY = process.env.PRIVATE_VAPID_KEY || ''
const EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@chathub.com'

webpush.setVapidDetails(EMAIL, PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY)

export class NotificationService {
    private pushSubscriptionsModel: IPushSubscriptionsModel

    constructor({ pushSubscriptionsModel }: IModels) {
        if (!pushSubscriptionsModel) 
            throw new Error('pushSubscriptionsModel is required in NotificationService')
        
        this.pushSubscriptionsModel = pushSubscriptionsModel
    }

    async saveSubscription(userId: string, data: SubscribeSchema) {
        await this.pushSubscriptionsModel.saveSubscription({
            userId,
            deviceType: 'web',
            endpoint: data.endpoint,
            p256dh: data.keys?.p256dh,
            auth: data.keys?.auth
        })
    }

    async removeSubscription(userId: string, data: UnsubscribeSchema) {
        await this.pushSubscriptionsModel.removeSubscription({
            userId,
            endpoint: data.endpoint
        })
    }

    async sendPushToUser(userId: string, payload: any) {
        const subscriptions = await this.pushSubscriptionsModel.getSubscriptionsByUserId({ userId })
        
        for (const sub of subscriptions) {
            if (sub.device_type === 'web') {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh || '',
                        auth: sub.auth || ''
                    }
                }

                try {
                    await webpush.sendNotification(pushSubscription, JSON.stringify(payload))
                } catch (error: any) {
                    if (error.statusCode === 404 || error.statusCode === 410) {
                        // The subscription has expired or is no longer valid
                        console.log(`Subscription ${sub.endpoint} expired or is invalid. Removing...`)
                        await this.pushSubscriptionsModel.removeSubscription({ userId, endpoint: sub.endpoint })
                    } else {
                        console.error('Error sending push notification:', error)
                    }
                }
            } else {
                // Here you would add Mobile FCM/APNs logic in the future
                console.log(`Device type ${sub.device_type} not implemented for push yet.`)
            }
        }
    }
}
