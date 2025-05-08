import express, { json } from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { join } from 'node:path'
import morgan from 'morgan'
import { corsMiddleware } from './middlewares/cors'
import { authMiddleware } from './middlewares/auth'
import { createAuthRouter } from './routes/authRoutes'
import { socketEventHandler } from './socket'
import { userModel } from './models/mysql/userModel'
import { userInfoModel } from './models/mysql/userInfoModel'
import { tempEmailsModel } from './models/mysql/tempEmailsModel'
import ip from './middlewares/internalIP'


export function createApp():void {
    const app = express()

    const PORT = process.env.PORT ?? 3001

    app.use(json())
    app.use(morgan('dev'))
    app.use(corsMiddleware())
    app.use(express.static(join(process.cwd(), '/client')))
    app.disable('x-powered-by')

    app.use('/', createAuthRouter({userModel, tempEmailsModel}))
    
    const server = createServer(app)

    const io = new Server(server)
    io.use(authMiddleware)

    io.on('connection', (socket) => {
        console.log('New connection for client -> ', socket.data)
        socketEventHandler(io, socket, {userModel, userInfoModel})
    })

    server.listen(PORT, ()=> console.log(`\nServer listen on Port:\n\n\tLocal:   http://localhost:${PORT}\n\n\tNetwork: http://${ip}:${PORT}\n`))
}

createApp()