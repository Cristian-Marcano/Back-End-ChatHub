import { QueryResult } from "mysql2"
import pool from "../../config/database"
import { ITempEmailsModel, TempEmail } from "../../interface/tempEmailsModel"
import { CodeEmailSchema } from "../../schemas/codeEmailSchemas"
import { UserSchema } from "../../schemas/userSchemas"

class TempEmailsModel implements ITempEmailsModel {
    async getTempEmail({input}: {input: UserSchema}): Promise<TempEmail[]> {
        const { email, username } = input
        const [tempEmail] = await pool.query('SELECT * FROM temp_emails WHERE email = ? OR username = ?', [email, username])  as QueryResult as [TempEmail[]]
        return tempEmail
    }
    
    async getTempEmailByEmail({input}: {input: CodeEmailSchema}): Promise<TempEmail[]> {
        const { email } = input
        const [tempEmail] = await pool.query('SELECT * FROM temp_emails WHERE email = ?', [email]) as QueryResult as [TempEmail[]]
        return tempEmail
    }

    async createTempEmail({input, cod}: {input: UserSchema, cod: number}): Promise<void> {
        const { email, username, password } = input
        await pool.query('INSERT INTO temp_emails(email, username, keyword, cod) VALUES (?,?,?,?)',[email, username, password, cod])
    }

    async updateTempEmail({input, cod}: {input: UserSchema, cod: number}): Promise<void> {
        const { email, username, password } = input
        await pool.query('UPDATE temp_emails SET cod = ?, username = ?, keyword = ? WHERE email = ?', [cod, username, password, email])
    }

    async updateTempEmailCod({input}: {input: CodeEmailSchema}): Promise<void> {
        const { email, code } = input
        await pool.query('UPDATE temp_emails SET cod = ?, create_at = NOW() WHERE email = ?', [code, email])
    }

    async removeTempEmail({input}: { input: CodeEmailSchema }): Promise<void> {
        const { email } = input
        await pool.query('DELETE FROM temp_emails WHERE email = ?', [email])
    }
}

export const tempEmailsModel = new TempEmailsModel()