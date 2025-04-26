import express, { json } from 'express'
import { createServer } from 'node:http'
import { join } from 'node:path'
import morgan from 'morgan'
import { corsMiddleware } from './middlewares/cors'
import { createAuthRouter } from './routes/authRoutes'
import { userModel } from './models/mysql/userModel'
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

    server.listen(PORT, ()=> console.log(`\nServer listen on Port:\n\n\tLocal:   http://localhost:${PORT}\n\n\tNetwork: http://${ip}:${PORT}\n`))
}

createApp()