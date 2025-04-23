import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UUID } from 'node:crypto'

const SECRET_KEY = process.env.SECRET_KEY ?? '$mAM4ÑE&r5/*XQL0'

export const assignToken = async({id}: {id:UUID}) => await jwt.sign({id}, SECRET_KEY, {algorithm: 'HS256'})


export const validateAuthorization = (req:Request, res:Response, next:NextFunction) => {
    const headerToken = req.headers['authorization']
    if(headerToken !== undefined && headerToken?.startsWith('Bearer ')) {
        try {
            const bearerToken = headerToken.substring(7)
            validateToken(bearerToken)
            next()
        } catch(error) {
            res.status(401).json({message:'Invalid token'})
        }
    } else res.status(400).json({message: 'Rejected'})
}


export const validateToken = (token:string) => jwt.verify(token, SECRET_KEY)