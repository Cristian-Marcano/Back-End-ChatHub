import express, { json } from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { join } from 'node:path'
import morgan from 'morgan'
import { corsMiddleware } from './middlewares/cors'
import { authMiddleware } from './middlewares/auth'
import { createAuthRouter } from './routes/authRoutes'
import { socketEventHandler } from './socket'
import { getModels } from './models'
import ip from './middlewares/internalIP'

export async function createApp(): Promise<void> {
    const app = express()

    const PORT = process.env.PORT ?? 3001

    app.use(json())
    app.use(morgan('dev'))
    app.use(corsMiddleware())
    app.use(express.static(join(process.cwd(), '/client')))
    app.disable('x-powered-by')

    // Obtenemos los modelos dependiendo de la DB configurada en .env
    const models = await getModels()

    app.use('/', createAuthRouter(models))
    
    const server = createServer(app)

    const io = new Server(server)
    io.use(authMiddleware)

    io.on('connection', (socket) => {
        console.log('New connection for client -> ', socket.data)
        socketEventHandler(io, socket, models)
    })

    server.listen(PORT, ()=> console.log(`\nServer listen on Port:\n\n\tLocal:   http://localhost:${PORT}\n\n\tNetwork: http://${ip}:${PORT}\n`))
}

createApp().catch((error) => {
    console.error('Failed to start application:', error)
    process.exit(1)
})