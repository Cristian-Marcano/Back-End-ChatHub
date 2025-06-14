import mysql from 'mysql2/promise'
import { CONFIG_MYSQL } from '../../config/keys'

const connectionConfig = CONFIG_MYSQL

const pool = mysql.createPool(connectionConfig)

pool.getConnection()
    .then((connection) => {
        pool.releaseConnection(connection)
        console.log('DB is connected\n')
    })
    .catch((e)=> console.log('DB connection is failed\n', e.message))

export default pool