import { CodeEmailSchema } from "../schemas/codeEmailSchemas"
import { UserSchema } from "../schemas/userSchemas"

export interface TempEmail {
    email: string,
    username: string,
    keyword: string,
    cod: number,
    create_at: Date
}

export interface ITempEmailsModel {
    getTempEmail(params: { input: UserSchema}): Promise<TempEmail[]>

    getTempEmailByEmail(params: {input: CodeEmailSchema}): Promise<TempEmail[]>

    createTempEmail(params: {input: UserSchema, cod: number}): Promise<void>

    updateTempEmail(params: {input: UserSchema, cod: number}): Promise<void>

    updateTempEmailCod(params: {input: CodeEmailSchema}): Promise<void>

    removeTempEmail(params: {input: CodeEmailSchema}): Promise<void>
}