import z from 'zod'

const userInfoSchemas = z.object({
    full_name: z.string({
        invalid_type_error: 'Full name must be a string',
        required_error: 'Full name is required'
    }).trim().min(1, 'Full name cannot be empty'),
    phone: z.string({
        invalid_type_error: 'Phone must be a string',
    }).trim().nullable().optional().default(null),
    photo: z.object({
        style: z.string(),
        seed: z.string(),
        options: z.record(z.unknown()).optional()
    }).nullable().optional().default(null),
    about: z.string({
        invalid_type_error: 'About must be a string'
    }).trim().max(200, 'About must be max length 200').nullable().optional().default(null)
})


const userInfoPartialSchemas = z.object({
    ...userInfoSchemas.shape
}).partial()

export type UserInfoSchema = z.infer<typeof userInfoSchemas>

export type UserInfoPartialSchema = z.infer<typeof userInfoPartialSchemas>

export const validateUserInfo = (input:object) => userInfoSchemas.safeParse(input)

export const validatePartialUserInfo = (input:object) => userInfoPartialSchemas.safeParse(input)