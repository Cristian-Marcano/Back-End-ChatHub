import z from 'zod'

const nickname = z.string({
    invalid_type_error: 'Nickname must be a string',
    required_error: 'Nickname is required'
}).trim().max(100,'Nickname must be max length 100')

const nicknamesPartialSchemas = z.object({
    primary_nickname: nickname,
    secondary_nickname: nickname
}).partial()

export type NicknamesPartialSchemas = z.infer<typeof nicknamesPartialSchemas>

export const validatePartialNicknames = (input: object) => nicknamesPartialSchemas.safeParse(input)