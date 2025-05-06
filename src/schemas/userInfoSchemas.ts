import z from 'zod'
import { userSchemas } from './userSchemas'

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
    }).trim().url().refine((urlStr) => {
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
    })
})


const userFullInfoSchemas = z.object({
    ...userSchemas.shape,
    ...userInfoSchemas.shape
})

export type UserInfoSchema = z.infer<typeof userInfoSchemas>

export type UserFullInfoSchema = z.infer<typeof userFullInfoSchemas>

export const validateUserInfo = (input:object) => userInfoSchemas.safeParse(input)

export const validatePartialUserFullInfo = (input:object) => userFullInfoSchemas.partial().safeParse(input)