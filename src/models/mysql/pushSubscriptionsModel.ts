import { QueryResult } from "mysql2"
import pool from "../../db/mysql"
import { IPushSubscription, IPushSubscriptionsModel } from "../../interface/pushSubscriptionsModel"

class PushSubscriptionsModel implements IPushSubscriptionsModel {
    async saveSubscription(input: { userId: string, deviceType?: 'web' | 'android' | 'ios', endpoint: string, p256dh?: string, auth?: string }): Promise<void> {
        const { userId, deviceType = 'web', endpoint, p256dh = null, auth = null } = input
        
        await pool.query(`
            INSERT INTO push_subscriptions (user_id, device_type, endpoint, p256dh, auth) 
            VALUES (UUID_TO_BIN(?), ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                device_type = VALUES(device_type), 
                p256dh = VALUES(p256dh), 
                auth = VALUES(auth)
        `, [userId, deviceType, endpoint, p256dh, auth])
    }

    async removeSubscription(input: { userId: string, endpoint: string }): Promise<void> {
        const { userId, endpoint } = input
        await pool.query('DELETE FROM push_subscriptions WHERE user_id = UUID_TO_BIN(?) AND endpoint = ?', [userId, endpoint])
    }

    async getSubscriptionsByUserId(input: { userId: string }): Promise<IPushSubscription[]> {
        const { userId } = input
        const [subs] = await pool.query(`
            SELECT id, BIN_TO_UUID(user_id) as user_id, device_type, endpoint, p256dh, auth, created_at 
            FROM push_subscriptions 
            WHERE user_id = UUID_TO_BIN(?)
        `, [userId]) as QueryResult as [IPushSubscription[]]
        
        return subs
    }
}

export const pushSubscriptionsModel = new PushSubscriptionsModel()
