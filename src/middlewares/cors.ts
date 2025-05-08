import cors from 'cors'

const ACCEPTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5500",
    "http://localhost:3001"
]

export const corsMiddleware = (acceptedOrigins = ACCEPTED_ORIGINS) => cors({
    origin: (requestOrigin, callback) => {
        if(!requestOrigin) return callback(null, true)
        
        if(acceptedOrigins.includes(requestOrigin)) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }
})