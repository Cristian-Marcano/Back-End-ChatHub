import z from 'zod'

const username = z.string({
    invalid_type_error: 'Username must be a string',
    required_error: 'Username is required'
}).trim()

const email = z.string({
    invalid_type_error: 'Email must be a string',
    required_error: 'Email is required'
}).trim().email('The email sent is not valid')


export const usernameAndEmailSchemas = z.object({
    username: username.optional(),
    email: email.optional()
})


const userSchemas = z.object({
    username: username.min(4, 'Username must be min length 4'),
    email,
    password: z.string({
        invalid_type_error: 'Password must be a string',
        required_error: 'Password is required'
    }).trim().min(6, 'Password must be min length 6')
})


const userPartialSchemas = z.object({
    ...userSchemas.shape,
    keyword: userSchemas.shape.password
}).partial()


const userRefineSchemas = z.object({
    ...usernameAndEmailSchemas.shape,
    password: userSchemas.shape.password
})

export type UserSchema = z.infer<typeof userSchemas>

export type UsernameAndEmailSchema = z.infer<typeof usernameAndEmailSchemas>

export type UserPartialSchema = z.infer<typeof userPartialSchemas>

export type UserRefineSchema = z.infer<typeof userRefineSchemas>

export const validateUser = (input:object) => userSchemas.safeParse(input)

export const validatePartialUser = (input:object) => userPartialSchemas.safeParse(input)

export const validateUsernameAndEmail = (input:object) => usernameAndEmailSchemas.refine(
    (data) => data.username || data.email,
    {
        message: 'At least username or email is required',
        path: ['username']
    }
).safeParse(input)

export const validateUserRefine = (input:object) => userRefineSchemas.refine(
    (data) => data.username || data.email,
    {
        message: 'At least username or email is required',
        path: ['username']
    }
).safeParse(input)