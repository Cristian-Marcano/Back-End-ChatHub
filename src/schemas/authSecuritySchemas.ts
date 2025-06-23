import z from 'zod'

const email = z.string({
    invalid_type_error: 'Email must be a string',
    required_error: 'Email is required'
}).email('Email is not valid').max(320, 'Email must be max length 320')

const password = z.string({
    invalid_type_error: 'Password must be a string',
    required_error: 'Password is required'
}).min(8, 'Password must be at least 8 characters')
  .max(300, 'Password must be max length 300')

export const forgotPasswordSchema = z.object({
    email
})

export const resetPasswordSchema = z.object({
    token: z.string({
        invalid_type_error: 'Token must be a string',
        required_error: 'Token is required'
    }),
    newPassword: password
})

export const refreshTokenSchema = z.object({
    refreshToken: z.string({
        invalid_type_error: 'Refresh Token must be a string',
        required_error: 'Refresh Token is required'
    })
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>

export const validateForgotPassword = (input: object) => forgotPasswordSchema.safeParse(input)
export const validateResetPassword = (input: object) => resetPasswordSchema.safeParse(input)
export const validateRefreshToken = (input: object) => refreshTokenSchema.safeParse(input)
