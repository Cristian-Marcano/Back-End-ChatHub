export const CONFIG_MYSQL = {
    host: process.env.HOST ?? 'localhost',
    user: process.env.USER ?? 'root',
    port: Number(process.env.DB_PORT) ?? 3306,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB ?? 'chathub'
}