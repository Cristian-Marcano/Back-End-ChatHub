import z from 'zod'

const endpoint = z.string({
    invalid_type_error: 'Endpoint must be a string',
    required_error: 'Endpoint is required'
}).url('Endpoint must be a valid URL')

const p256dh = z.string().optional()
const auth = z.string().optional()

export const subscribeSchema = z.object({
    endpoint,
    keys: z.object({
        p256dh,
        auth
    }).optional()
})

export const unsubscribeSchema = z.object({
    endpoint
})

export type SubscribeSchema = z.infer<typeof subscribeSchema>
export type UnsubscribeSchema = z.infer<typeof unsubscribeSchema>

export const validateSubscribe = (input: object) => subscribeSchema.safeParse(input)
export const validateUnsubscribe = (input: object) => unsubscribeSchema.safeParse(input)
