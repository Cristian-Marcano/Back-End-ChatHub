import z from 'zod'

const userSchemas = z.object({
    username: z.string({
        invalid_type_error: 'Username must be a string',
        required_error: 'Username is required',
    }).trim().min(4, 'Username must be min length 4'),
    email: z.string({
        invalid_type_error: 'Email must be a string',
        required_error: 'Email is required'
    }).trim().email('The email sent is not valid'),
    password: z.string({
        invalid_type_error: 'Password must be a string',
        required_error: 'Password is required'
    }).trim().min(6, 'Password must be min length 6')
})


const userPartialSchemas = z.object({
    ...userSchemas.shape,
    username: userSchemas.shape.username.optional(),
    email: userSchemas.shape.email.optional()
})

export type UserSchema = z.infer<typeof userSchemas>

export type UserPartialSchema = z.infer<typeof userPartialSchemas>

export const validateUser = (input:object) => userSchemas.safeParse(input)

export const validatePartialUser = (input:object) => userPartialSchemas.safeParse(input)