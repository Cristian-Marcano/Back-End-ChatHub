import { Server, Socket } from "socket.io"
import { Request, Response } from "express"
import { UserService } from "../services/userService"
import { validatePaginationUsernameAndEmail } from "../schemas/paginationSchemas"
import { validateUserInfo, validatePartialUserInfo } from "../schemas/userInfoSchemas"
import { validatePartialUser } from "../schemas/userSchemas"
import { mailTo } from "../utils/mailTo"
import { emailChangeRequestsModel } from "../models/mysql/emailChangeRequestsModel"
import { EmailChangeRequestSchema, EmailChangeVerifySchema } from "../schemas/emailChangeSchemas"
import { userModel } from "../models/mysql/userModel"
import { UUID } from "node:crypto"
import { getChangeEmailOldTemplate, getChangeEmailNewTemplate } from "../utils/emailTemplates/templates"

export class UserController {
    private userService: UserService

    constructor({userService}: {userService: UserService}) {
        this.userService = userService
    }

    search = async(namespace:string, io: Server, socket: Socket, data: object): Promise<void> => {
        const resultSchema = validatePaginationUsernameAndEmail(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const { id } = socket.data
            const users = await this.userService.searchUser({input:resultSchema.data, id})

            socket.emit(`${namespace}:results`, {results: users})
        } catch(error:any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }

    createInfo = async(namespace:string, io: Server, socket: Socket, data: object): Promise<void> => {
        const resultSchema = validateUserInfo(data)

        if(!resultSchema.success) {
            socket.emit('error:validate', {error: JSON.parse(resultSchema.error.message)})
            return
        }

        try {
            const { id } = socket.data
            await this.userService.createUserInfo({input: resultSchema.data, id})

            socket.emit(`${namespace}:info-created`, {message: 'User info was created'})
        } catch(error: any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }

    update = async(namespace:string, io:Server, socket: Socket, data: object): Promise<void> => {
        const resultUser = validatePartialUser(data), resultUserInfo = validatePartialUserInfo(data)

        if(!resultUser.success || !resultUserInfo.success) {
            const errors = []
            if(!resultUser.success)
                errors.push(...JSON.parse(resultUser.error.message))

            if(!resultUserInfo.success)
                errors.push(...JSON.parse(resultUserInfo.error.message))

            socket.emit('error:validate', {error: errors})
            return
        }

        try {
            const { id } = socket.data
            await this.userService.updateUser({input: resultUser.data, inputInfo: resultUserInfo.data, id})

            socket.emit(`${namespace}:updated`, {message: 'User was updated'})
        } catch(error: any) {
            socket.emit('error:server', {message: 'Server error'})
        }
    }

    getInfoHttp = async(req: Request, res: Response): Promise<void> => {
        const userId = req.body.userPayload?.id

        if(!userId) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        try {
            const userInfo = await this.userService.getUserInfoById({id: userId})
            if (!userInfo) {
                res.status(404).json({message: 'User info not found'})
                return
            }
            res.status(200).json(userInfo)
        } catch (error: any) {
            res.status(500).json({message: 'Server error', error})
        }
    }

    upsertInfoHttp = async(req: Request, res: Response): Promise<void> => {
        const resultSchema = validateUserInfo(req.body)
        const userId = req.body.userPayload?.id

        if(!resultSchema.success) {
            res.status(422).json({error: JSON.parse(resultSchema.error.message)})
            return
        }

        if(!userId) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        try {
            await this.userService.upsertUserInfo({input: resultSchema.data, id: userId})
            res.status(200).json({message: 'User info was successfully created or updated'})
        } catch (error: any) {
            res.status(500).json({message: 'Server error', error})
        }
    }

    patchInfoHttp = async(req: Request, res: Response): Promise<void> => {
        const resultSchema = validatePartialUserInfo(req.body)
        const userId = req.body.userPayload?.id

        if(!resultSchema.success) {
            res.status(422).json({error: JSON.parse(resultSchema.error.message)})
            return
        }

        if(!userId) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        if (Object.keys(resultSchema.data).length === 0) {
            res.status(400).json({message: 'No data provided to update'})
            return
        }

        try {
            await this.userService.updateUserInfoOnly({input: resultSchema.data, id: userId})
            res.status(200).json({message: 'User info was successfully partially updated'})
        } catch (error: any) {
            res.status(500).json({message: 'Server error', error})
        }
    }

    updateSettingsHttp = async(req: Request, res: Response): Promise<void> => {
        const resultUser = validatePartialUser(req.body)
        const resultUserInfo = validatePartialUserInfo(req.body)
        const userId = req.body.userPayload?.id

        if(!userId) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        if(!resultUser.success || !resultUserInfo.success) {
            const errors = []
            if(!resultUser.success)
                errors.push(...JSON.parse(resultUser.error.message))

            if(!resultUserInfo.success)
                errors.push(...JSON.parse(resultUserInfo.error.message))

            res.status(422).json({error: errors})
            return
        }

        try {
            await this.userService.updateUser({input: resultUser.data, inputInfo: resultUserInfo.data, id: userId})
            res.status(200).json({message: 'User settings were successfully updated'})
        } catch(error: any) {
            console.error('Error updating settings HTTP:', error)
            if (error.code === 'ER_DUP_ENTRY') {
                const message = error.message.includes('email') 
                    ? 'El correo electrónico ya está en uso por otro usuario.'
                    : 'El nombre de usuario ya está en uso por otro usuario.';
                res.status(409).json({ message });
                return;
            }
            res.status(500).json({message: 'Server error', error: error.message})
        }
    }

    initEmailChange = async(req: Request, res: Response): Promise<void> => {
        const result = EmailChangeRequestSchema.safeParse(req.body)
        const userId = req.body.userPayload?.id

        if (!userId) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        if (!result.success) {
            res.status(422).json({error: JSON.parse(result.error.message)})
            return
        }

        try {
            // Get user's current email
            const users = await userModel.getUserById({id: userId})
            if (!users || users.length === 0) {
                res.status(404).json({message: 'User not found'})
                return
            }
            const oldEmail = users[0].email
            const newEmail = result.data.new_email

            // Check if new email is already in use
            const existingUsers = await userModel.getUserByUsernameOrEmail({input: { email: newEmail, username: undefined, password: '' } as any})
            if (existingUsers && existingUsers.length > 0) {
                res.status(409).json({message: 'El nuevo correo electrónico ya está en uso'})
                return
            }

            const oldCode = Math.floor(100000 + Math.random() * 900000)
            const newCode = Math.floor(100000 + Math.random() * 900000)

            await emailChangeRequestsModel.createRequest({
                userId, oldEmail, newEmail, oldCode, newCode
            })

            // Send emails
            await mailTo(
                oldEmail, 
                'Código para cambiar de correo', 
                `Tu código de seguridad para cambiar tu correo es: ${oldCode}\nSi no fuiste tú, por favor cambia tu contraseña inmediatamente.`,
                getChangeEmailOldTemplate(oldCode)
            )
            await mailTo(
                newEmail, 
                'Verifica tu nuevo correo', 
                `Tu código de verificación para enlazar este correo a tu cuenta es: ${newCode}`,
                getChangeEmailNewTemplate(newCode)
            )

            res.status(200).json({message: 'Verification codes sent to both emails'})
        } catch (error: any) {
            console.error('Error init email change:', error)
            res.status(500).json({message: 'Server error', error: error.message})
        }
    }

    verifyEmailChange = async(req: Request, res: Response): Promise<void> => {
        const result = EmailChangeVerifySchema.safeParse(req.body)
        const userId = req.body.userPayload?.id

        if (!userId) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        if (!result.success) {
            res.status(422).json({error: JSON.parse(result.error.message)})
            return
        }

        try {
            const requests = await emailChangeRequestsModel.getRequest({userId})
            if (!requests || requests.length === 0) {
                res.status(404).json({message: 'No pending email change request found'})
                return
            }

            const request = requests[0]

            if (request.old_code !== result.data.old_code || request.new_code !== result.data.new_code) {
                res.status(401).json({message: 'Códigos incorrectos. Verifica que hayas ingresado los códigos correctos en cada campo.'})
                return
            }

            // Update user's email
            await userModel.updateUser({input: { email: request.new_email }, id: userId})
            
            // Delete request
            await emailChangeRequestsModel.deleteRequest({userId})

            res.status(200).json({message: 'Email updated successfully', new_email: request.new_email})
        } catch (error: any) {
            console.error('Error verify email change:', error)
            res.status(500).json({message: 'Server error', error: error.message})
        }
    }
}