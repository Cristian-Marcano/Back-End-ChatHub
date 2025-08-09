import z from 'zod'

const messageId = z.number({
    invalid_type_error: 'messageId must be a number',
    required_error: 'messageId is required'
}).int('messageId must be a integer').positive('messageId must be positive')

export const chatId = z.number({
    invalid_type_error: 'chatId must be a number',
    required_error: 'chatId is required'
}).int('chatId must be a integer').positive('chatId must be positive')

const chatIdSchema = z.object({ chatId })

const messageSchemas = z.object({
    msgText: z.string({
        invalid_type_error: 'msgText must be a string',
        required_error: 'msgText is required'
    }).max(65530, 'msgText must be max length 65530'),
    chatId
})

const messageViewSchemas = z.object({
    userId: z.string({
        invalid_type_error: 'User Id must be a string',
        required_error: 'User Id is required'
    }).uuid('User Id must be UUID'),
    messageId
})

export type ChatId = z.infer<typeof chatId>

export type MessageId = z.infer<typeof messageId>

export type MessageSchema = z.infer<typeof messageSchemas>

export type MessageViewSchema = z.infer<typeof messageViewSchemas>

const messageEditSchema = z.object({
    messageId,
    chatId,
    msgText: z.string({
        invalid_type_error: 'msgText must be a string',
        required_error: 'msgText is required'
    }).max(65530, 'msgText must be max length 65530')
})

const messageDeleteSchema = z.object({
    messageId,
    chatId
})

export type MessageEditSchema = z.infer<typeof messageEditSchema>
export type MessageDeleteSchema = z.infer<typeof messageDeleteSchema>

export const validateChatId = (input: object) => chatIdSchema.safeParse(input)

export const validateMessageId = (input: object) => messageId.safeParse(input)

export const validateMessage = (input: object) => messageSchemas.safeParse(input)

export const validateMessageView = (input: object) => messageViewSchemas.safeParse(input)

export const validateMessageEdit = (input: object) => messageEditSchema.safeParse(input)

export const validateMessageDelete = (input: object) => messageDeleteSchema.safeParse(input)
const messageSearchSchema = z.object({
    chatId,
    query: z.string().min(1, 'query must not be empty'),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().default(20)
})

const messageContextSchema = z.object({
    chatId,
    targetMessageId: messageId
})

export type MessageSearchSchema = z.infer<typeof messageSearchSchema>
export type MessageContextSchema = z.infer<typeof messageContextSchema>

export const validateMessageSearch = (input: object) => messageSearchSchema.safeParse(input)
export const validateMessageContext = (input: object) => messageContextSchema.safeParse(input)
