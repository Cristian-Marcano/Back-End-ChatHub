import pool from './index'
import { PoolConnection } from 'mysql2/promise'

export async function withTransaction<T>(callback: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const conn = await pool.getConnection()

    try {
        await conn.beginTransaction()

        const result = await callback(conn)
        await conn.commit()

        return result
    } catch(error: any) {
        await conn.rollback()
        throw error
    } finally {
        conn.release()
    }
}