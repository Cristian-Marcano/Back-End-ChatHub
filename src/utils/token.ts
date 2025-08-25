import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import crypto, { UUID } from 'node:crypto'

const SECRET_KEY = process.env.SECRET_KEY as string
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY as string

if (!SECRET_KEY || !REFRESH_SECRET_KEY) {
  console.warn('WARNING: SECRET_KEY or REFRESH_SECRET_KEY is not defined in .env');
}

export const assignToken = ({id}: {id:UUID | string}) => jwt.sign({id}, SECRET_KEY, {algorithm: 'HS256', expiresIn: '15m'})

export const generateRandomToken = () => crypto.randomBytes(40).toString('hex')

export const validateAuthorization = (req:Request, res:Response, next:NextFunction) => {
    const headerToken = req.headers['authorization']
    if(headerToken !== undefined && headerToken?.startsWith('Bearer ')) {
        try {
            const bearerToken = headerToken.substring(7)
            if (!req.body) req.body = {}
            req.body.userPayload = validateToken(bearerToken)
            next()
        } catch(error) {
            res.status(401).json({message:'Invalid token'})
        }
    } else res.status(401).json({message: 'Rejected'})
}

export const validateToken = (token:string) => jwt.verify(token, SECRET_KEY)
