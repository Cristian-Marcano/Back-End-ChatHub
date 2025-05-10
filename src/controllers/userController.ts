import { Server, Socket } from "socket.io"
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
}