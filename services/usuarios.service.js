import { connect } from "../database/db.js"
import bcrypt from 'bcrypt'

export class UsuariosService {

    async insert(obj) {
        const conn = await connect()

        const senha = await bcrypt.hash(obj.senha, 10)
        await conn.query(
            'INSERT INTO usuarios (login, senha, email) VALUES (?,?,?);',
            [obj.login, senha, obj.email]
        )
    }

    async findByLogin(login) {
        const conn = await connect()
        const [rows] = await conn.query(`SELECT * FROM usuarios WHERE login = '${login}'`)

        return rows.length ? rows[0] : null
    }

    async auth(login, senha) {
        const user = await this.findByLogin(login)
        if (!user) throw new Error("Usuário não existe")

        const passwordMatch = await bcrypt.compare(senha, user.senha);
        if (!passwordMatch) {
            throw new Error("Senha inválida")
        }

        return user
    }
}