import { UUID } from "node:crypto"
import { PoolConnection, QueryResult } from "mysql2/promise"
import { FriendshipGeneral, FriendshipUser, IFriendshipModel } from "../../interface/friendshipModel"
import { FriendshipShema, State, StateSchema } from "../../schemas/friendshipSchemas"
import pool from "../../db/mysql"


class FriendshipModel implements IFriendshipModel {
    async getFriendshipById({id}: {id: number}): Promise<FriendshipGeneral[]> {
        const sql = `SELECT f.id AS id, BIN_TO_UUID(f.primary_user_id) AS primary_user_id, BIN_TO_UUID(f.secondary_user_id) AS secondary_user_id, primary_state,
                    secondary_state, f.create_at AS create_at, update_at, ua1.username AS primary_user_username, ua1.email AS primary_user_email,
                    ua1.create_at AS primary_user_create_at, ua2.username AS secondary_user_username,ua2.email AS secondary_user_email, ua2.create_at AS secondary_user_create_at
                    FROM friendship AS f JOIN user_account AS ua1 ON f.primary_user_id = ua1.id JOIN user_account AS ua2 ON f.secondary_user_id = ua2.id WHERE f.id = ?`
        const [friendship] = await pool.query(sql, [id])as QueryResult as [FriendshipGeneral[]]
        return friendship
    }

    async getFriendshipsByUserId({state, id}: {state: State, id: UUID}): Promise<FriendshipUser[]> {
        const sql = `SELECT f.id AS id, BIN_TO_UUID(f.primary_user_id) AS primary_user_id, BIN_TO_UUID(f.secondary_user_id) AS secondary_user_id, primary_state, 
                    secondary_state, f.create_at AS create_at, update_at, ua.username AS username, ua.email AS email, ua.create_at AS user_create_at FROM friendship AS f 
                    JOIN user_account AS ua ON f.secondary_user_id = ua.id WHERE (primary_user_id = UUID_TO_BIN(?) OR secondary_user_id = UUID_TO_BIN(?)) AND
                    (primary_state = ? OR secondary_state = ?)`
        const [friendship] = await pool.query(sql, [id, id, state, state]) as QueryResult as [FriendshipUser[]]
        return friendship
    }

    async createFriendship({input}: {input: FriendshipShema}, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool, {primary_user_id, secondary_user_id, primary_state, secondary_state} = input
        await execute.query('INSERT INTO friendship(primary_user_id, secondary_user_id, primary_state, secondary_state) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?)', 
                            [primary_user_id, secondary_user_id, primary_state, secondary_state])
    }

    async updateFriendship({input, id}: {input: StateSchema, id: number}, conn?: PoolConnection): Promise<void> {
        const execute = conn ?? pool
        await execute.query('UPDATE friendship SET ? WHERE id = ?', [input, id])
    }

    async removeFriendship({id}: {id: number}): Promise<void> {
        await pool.query('DELETE FROM friendship WHERE id = ?', [id])
    }
}

export const friendshipModel = new FriendshipModel()