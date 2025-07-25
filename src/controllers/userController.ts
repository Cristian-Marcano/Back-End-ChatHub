import { Server, Socket } from "socket.io"
import { Request, Response } from "express"
import { UserService } from "../services/userService"
import { validatePaginationUsernameAndEmail } from "../schemas/paginationSchemas"
import { validateUserInfo, validatePartialUserInfo } from "../schemas/userInfoSchemas"
import { validatePartialUser } from "../schemas/userSchemas"

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
            res.status(500).json({message: 'Server error', error: error.message})
        }
    }
}