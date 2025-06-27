export interface IPushSubscription {
    id: number;
    user_id: string;
    device_type: 'web' | 'android' | 'ios';
    endpoint: string;
    p256dh: string | null;
    auth: string | null;
    created_at: Date;
}

export interface IPushSubscriptionsModel {
    saveSubscription(input: { userId: string, deviceType?: 'web' | 'android' | 'ios', endpoint: string, p256dh?: string, auth?: string }): Promise<void>;
    removeSubscription(input: { userId: string, endpoint: string }): Promise<void>;
    getSubscriptionsByUserId(input: { userId: string }): Promise<IPushSubscription[]>;
}
