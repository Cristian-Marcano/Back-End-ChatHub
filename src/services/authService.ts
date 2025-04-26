import { IModels } from "../interface/models"
import { ITempEmailsModel } from "../interface/tempEmailsModel"
import { IUserModel } from "../interface/userModel"
import { CodeEmailSchema } from "../schemas/codeEmailSchemas"
import { UserPartialSchema, UserSchema } from "../schemas/userSchemas"
import { genereteHashedPassword, validateHashedPassword } from "../utils/password"
import { assignToken } from "../utils/token"
import { mailTo } from "../utils/mailTo"

export class AuthService {
    private userModel: IUserModel
    private tempEmailsModel: ITempEmailsModel

    constructor({userModel, tempEmailsModel}: IModels) {
        if(!userModel || !tempEmailsModel) 
            throw new Error(`${(!userModel && !tempEmailsModel) ? 'userModel and tempEmailModel': (!userModel) ? 'userModel' : 'tempEmailModel'} is required in AuthService`)

        this.userModel = userModel
        this.tempEmailsModel = tempEmailsModel
    }

    async registerTemporalEmail({input}: {input: UserSchema}) {
        const cod:number = Math.floor(100000 + Math.random() * 900000)
        
        const tempEmails = await this.tempEmailsModel.getTempEmail({input})

        if(tempEmails.length === 0) {
            await this.tempEmailsModel.createTempEmail({input, cod})
            await mailTo(input.email, 'Titulo de Codigo de autenticacion', `Se le adjunta el siguiente codigo para autenticarse en la API ${cod}`)
            return
        }

        const containTempEmail = tempEmails.filter((value)=> value.email === value.email).length > 0

        if(containTempEmail) {
            await this.tempEmailsModel.updateTempEmail({input, cod})
            await mailTo(input.email, 'Titulo de Codigo de autenticacion', `Se le adjunta el siguiente codigo para autenticarse en la API ${cod}`)
            return
        }
        
        throw new Error('USERNAME_EXIST')
    }

    async verifyUserExist({input}: {input: UserSchema}) {
        const existingUser = await this.userModel.getUser({input})

        if(existingUser.length > 0) {
            const isUsername = existingUser.filter((value) => value.username === input.username)
            throw new Error(isUsername.length > 0 ? 'USERNAME_EXISTS' : 'EMAIL_EXISTS')
        } 
    }

    async registerUser({input}: {input: UserSchema}) {
        const hashedPassword = await genereteHashedPassword(input.password)

        await this.userModel.createUser({
            input: { ...input, password: hashedPassword }
        })
    }

    async verifyCodeEmail({input}: {input: CodeEmailSchema}) {
        const tempEmail = await this.tempEmailsModel.getTempEmailByEmail({input})

        if(tempEmail.length === 0)
            throw new Error('EMAIL_NOT_FOUND')

        const { cod, email, username, keyword:password } = tempEmail[0]

        if(cod === input.code) {
            await this.tempEmailsModel.removeTempEmail({input})
            return { username, password, email }
        }

        throw new Error('CODE_INVALID')
    }

    async loginUser({input}: {input: UserPartialSchema}) {
        const user = await this.userModel.getUserByUsernameOrEmail({input})

        if(user.length === 0) throw new Error('INVALID_CREDENTIALS')

        const { keyword: hashedPassword, id } = user[0]

        const isValid = await validateHashedPassword(input.password, hashedPassword)

        if(!isValid) throw new Error('INVALID_CREDENTIALS')

        const token = await assignToken({id})
        return { token }
    }
}