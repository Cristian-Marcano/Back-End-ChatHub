import { Server, Socket } from "socket.io"
import { UserService } from "../services/userService"
import { validatePaginationUsernameAndEmail } from "../schemas/paginationSchemas"

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
}