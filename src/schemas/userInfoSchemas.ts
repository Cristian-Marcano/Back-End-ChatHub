import z from 'zod'

const userInfoSchemas = z.object({
    full_name: z.string({
        invalid_type_error: 'Full name must be a string',
        required_error: 'Full name is required'
    }).trim(),
    phone: z.string({
        invalid_type_error: 'Phone must be a string',
        required_error: 'Phone is required'
    }).trim(),
    photo: z.string({
        invalid_type_error: 'Photo must be a string',
        required_error: 'Photo is required',
    }).trim().max(2000, 'Photo must be max length').url().refine((urlStr) => {
        try {
            const url = new URL(urlStr)
            return (
                url.hostname === 'api.dicebear.com' && 
                url.pathname.includes('/svg') && 
                url.searchParams.has('seed')
            )
        } catch {
            return false
        }
    }),
    about: z.string({
        invalid_type_error: 'About must be a string'
    }).trim().max(200, 'About must be max length 200').default('')
})


const userInfoPartialSchemas = z.object({
    ...userInfoSchemas.shape
}).partial()

export type UserInfoSchema = z.infer<typeof userInfoSchemas>

export type UserInfoPartialSchema = z.infer<typeof userInfoPartialSchemas>

export const validateUserInfo = (input:object) => userInfoSchemas.safeParse(input)

export const validatePartialUserInfo = (input:object) => userInfoPartialSchemas.safeParse(input)