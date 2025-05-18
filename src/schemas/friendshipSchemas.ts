import z from 'zod'

const id = z.number({
    invalid_type_error: 'Id must be a number',
    required_error: 'Id is required'
}).int('Id must be a integer').positive('Id must be positive')

const user_id = z.string({
    invalid_type_error: 'User id must be a string',
    required_error: 'User id is required'
}).uuid('User id must be UUID')

const state = z.enum(
    ['pending', 'blocked', 'accepted'],{
    invalid_type_error: 'State must be a string',
    required_error: 'State is required'
})


const friendshipSchemas = z.object({
    primary_user_id: user_id,
    secondary_user_id: user_id,
    primary_state: state.default('pending'),
    secondary_state: state.default('pending')
})

export type UserId = z.infer<typeof user_id>

export type State = z.infer<typeof state>

export type FriendshipShema = z.infer<typeof friendshipSchemas>

export const validateId = (input: object) => id.safeParse(input)

export const validateUserId = (input: object) => user_id.safeParse(input)

export const validateState = (input: object) => state.safeParse(input)

export const validateFriendship = (input: object) => friendshipSchemas.safeParse(input)