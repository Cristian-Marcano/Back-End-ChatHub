import bcrypt from 'bcrypt'

const salt = Number(process.env.SALT) ?? 10

export const genereteHashedPassword = async(password:string):Promise<string> => await bcrypt.hash(password, salt)

export const validateHashedPassword = async(password:string, hashedPassword:string):Promise<boolean> => await bcrypt.compare(password, hashedPassword)