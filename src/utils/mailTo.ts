import { createTransport } from 'nodemailer'

const USER_MAIL = process.env.USER_MAIL ?? 'email@gmail.com'
const USER_MAIL_KEY = process.env.USER_MAIL_KEY ?? '**** **** **** ****'

export const mailTo = async(to:string, subject:string, text:string) => {
    const transport = createTransport({
        service: 'gmail',
        auth: {
            user: USER_MAIL,
            pass: USER_MAIL_KEY
        }
    })

    const mailOptions = {
        from: USER_MAIL,
        to,
        subject,
        text
    }

    try {
        const info = await transport.sendMail(mailOptions)
        console.log(info.response)
        return { info }
    } catch(error) {
        console.log("Error sending email: ", error)
        throw error
    }
}