import { QueryResult } from "mysql2/promise"
import pool from "../../db/mysql"
import { UUID } from "crypto"

export interface EmailChangeRequest {
    id: UUID;
    user_id: UUID;
    old_email: string;
    new_email: string;
    old_code: number;
    new_code: number;
    created_at: Date;
}

class EmailChangeRequestsModel {
    async getRequest({userId}: {userId: UUID}): Promise<EmailChangeRequest[]> {
        const [requests] = await pool.query('SELECT BIN_TO_UUID(id) AS id, BIN_TO_UUID(user_id) AS user_id, old_email, new_email, old_code, new_code, created_at FROM email_change_requests WHERE user_id = UUID_TO_BIN(?)', [userId]) as QueryResult as [EmailChangeRequest[]]
        return requests
    }

    async createRequest({userId, oldEmail, newEmail, oldCode, newCode}: {userId: UUID, oldEmail: string, newEmail: string, oldCode: number, newCode: number}): Promise<void> {
        // Delete any existing request for this user first
        await pool.query('DELETE FROM email_change_requests WHERE user_id = UUID_TO_BIN(?)', [userId])
        await pool.query('INSERT INTO email_change_requests(user_id, old_email, new_email, old_code, new_code) VALUES (UUID_TO_BIN(?),?,?,?,?)', [userId, oldEmail, newEmail, oldCode, newCode])
    }

    async deleteRequest({userId}: {userId: UUID}): Promise<void> {
        await pool.query('DELETE FROM email_change_requests WHERE user_id = UUID_TO_BIN(?)', [userId])
    }
}

export const emailChangeRequestsModel = new EmailChangeRequestsModel()
