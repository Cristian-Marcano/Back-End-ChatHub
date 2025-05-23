import z from 'zod'

const messageId = z.number({
    invalid_type_error: 'messageId must be a number',
    required_error: 'messageId is required'
}).int('messageId must be a integer').positive('messageId must be positive')

export const chatId = z.number({
    invalid_type_error: 'chatId must be a number',
    required_error: 'chatId is required'
}).int('chatId must be a integer').positive('chatId must be positive')

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

export const validateChatId = (input: object) => chatId.safeParse(input)

export const validateMessageId = (input: object) => messageId.safeParse(input)

export const validateMessage = (input: object) => messageSchemas.safeParse(input)

export const validateMessageView = (input: object) => messageViewSchemas.safeParse(input)