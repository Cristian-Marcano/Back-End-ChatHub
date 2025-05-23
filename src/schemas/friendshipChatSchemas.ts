import z from 'zod'

const nickname = z.string({
    invalid_type_error: 'Nickname must be a string',
    required_error: 'Nickname is required'
}).trim().max(100,'Nickname must be max length 100')


const friendshipChatSchemas = z.object({
    friendshipId: z.number({
        invalid_type_error: "frienshipId must be a number",
        required_error: 'friendshipId is required'
    }).int('friendshipId must be a integer').positive('friendshipId must be positive'),
    chatId: z.number({
        invalid_type_error: "chatId must be a number",
        required_error: 'chatId is required'
    }).int('chatId must be a integer').positive('chatId must be positive')
})


const nicknamesPartialSchemas = z.object({
    primary_nickname: nickname,
    secondary_nickname: nickname
}).partial()

export type FriendshipChatSchema = z.infer<typeof friendshipChatSchemas>

export type NicknamesPartialSchema = z.infer<typeof nicknamesPartialSchemas>

export const validateFriendshipChat = (input: object) => friendshipChatSchemas.safeParse(input)

export const validatePartialNicknames = (input: object) => nicknamesPartialSchemas.safeParse(input)