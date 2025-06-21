import z from 'zod'

const nickname = z.string({
    invalid_type_error: 'Nickname must be a string',
    required_error: 'Nickname is required'
}).min(2, 'Nickname must be at least 2 characters').max(100, 'Nickname must be max length 100')

const userId = z.string({
    invalid_type_error: 'User Id must be a string',
    required_error: 'User Id is required'
}).uuid('User Id must be a UUID')

const chatId = z.number({
    invalid_type_error: 'chatId must be a number',
    required_error: 'chatId is required'
}).int('chatId must be an integer').positive('chatId must be positive')

const createGroupSchema = z.object({
    nickname,
    members: z.array(userId).optional() // Opcionalmente puede incluir UUIDs de otros usuarios para agregarlos al momento
})

const addMemberSchema = z.object({
    chatId,
    memberId: userId
})

const leaveGroupSchema = z.object({
    chatId
})

export type CreateGroupSchema = z.infer<typeof createGroupSchema>
export type AddMemberSchema = z.infer<typeof addMemberSchema>
export type LeaveGroupSchema = z.infer<typeof leaveGroupSchema>

export const validateCreateGroup = (input: object) => createGroupSchema.safeParse(input)
export const validateAddMember = (input: object) => addMemberSchema.safeParse(input)
export const validateLeaveGroup = (input: object) => leaveGroupSchema.safeParse(input)
