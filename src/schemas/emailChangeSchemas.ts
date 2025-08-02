import z from 'zod'

export const EmailChangeRequestSchema = z.object({
    new_email: z.string().email('Nuevo correo inválido')
})

export const EmailChangeVerifySchema = z.object({
    old_code: z.number().int().min(100000).max(999999),
    new_code: z.number().int().min(100000).max(999999)
})
