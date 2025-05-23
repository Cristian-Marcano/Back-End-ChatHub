import z from 'zod'
import { usernameAndEmailSchemas } from './userSchemas'
import { chatId } from './messageSchemas'

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

const paginationNameSchemas = z.object({
    ...paginationSchemas.shape,
    name: z.string({
        invalid_type_error: 'Name must be a string',
        required_error: 'Name is required'
    }).trim()
})

const paginationUsernameAndEmailSchemas = z.object({
    ...paginationSchemas.shape,
    ...usernameAndEmailSchemas.shape
})

const paginationChatIdSchemas = z.object({
    ...paginationSchemas.shape,
    chatId
})

export type PaginationSchema = z.infer<typeof paginationSchemas>

export type PaginationNameSchema = z.infer<typeof paginationNameSchemas>

export type PaginationUsernameAndEmailSchema = z.infer<typeof paginationUsernameAndEmailSchemas>

export type PaginationChatIdSchema = z.infer<typeof paginationChatIdSchemas>

export const validatePagination = (input:object) => paginationSchemas.safeParse(input)

export const validatePaginationName = (input:object) => paginationNameSchemas.safeParse(input)

export const validatePaginationUsernameAndEmail = (input:object) => paginationUsernameAndEmailSchemas.refine(
    (data) => data.username || data.email,
    {
        message: 'At least username or email is required',
        path: ['username']
    }
).safeParse(input)

export const validatePaginationChatId = (input:object) => paginationChatIdSchemas.safeParse(input)