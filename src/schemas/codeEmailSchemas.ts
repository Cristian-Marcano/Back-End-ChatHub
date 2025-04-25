import z from 'zod'

const codeEmail = z.object({
    code: z.number({
        invalid_type_error: 'Code must be a number',
        required_error: 'Code is required'
    }),
    email: z.string({
        invalid_type_error: 'Email must be a string',
        required_error: 'Email is required'
    }).email('The email sent is not valid'),
})

export type CodeEmailSchema = z.infer<typeof codeEmail>

export const validateCodeEmail = (input:object) => codeEmail.safeParse(input)