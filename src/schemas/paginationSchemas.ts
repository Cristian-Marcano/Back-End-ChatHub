import z from 'zod'
import { usernameAndEmailSchemas } from './userSchemas'

const paginationSchemas = z.object({
    page: z.number({
        invalid_type_error: 'Page must be a number',
        required_error: 'Page is required'
    }).int('Page must be a integer').positive('Page must be positive').default(1),
    pageSize: z.number({
        invalid_type_error: 'PageSize must be a number',
        required_error: 'PageSize is required'
    }).int('PageSize must be a integer').positive('PageSize must be positive').default(10)
})

const paginationUsernameAndEmailSchemas = z.object({
    ...paginationSchemas.shape,
    ...usernameAndEmailSchemas.shape
})

export type PaginationUsernameAndEmailSchema = z.infer<typeof paginationUsernameAndEmailSchemas>

export const validatePaginationUsernameAndEmail = (input:object) => paginationUsernameAndEmailSchemas.refine(
    (data) => data.username || data.email,
    {
        message: 'At least username or email is required',
        path: ['username']
    }
).safeParse(input)