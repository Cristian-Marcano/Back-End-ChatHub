export const CONFIG = {
    host: process.env.HOST ?? 'localhost',
    user: process.env.USER ?? 'root',
    port: Number(process.env.DB_PORT) ?? 3306,
    password: process.env.PASSWORD ?? 'Contraseña1/',
    database: process.env.DB ?? 'chathub'
}