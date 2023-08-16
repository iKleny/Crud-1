import { connect } from "../database/db.js";

export class GastosService {

    async insert(gasto) {
        const conn = await connect()
        return await conn.query(
            'INSERT INTO gastos(nome, tipo, credito, data, debito, motivo) VALUES (?,?,?,?,?,?)', 
            [gasto.nome, gasto.tipo, gasto.credito, gasto.data, gasto.debito, gasto.motivo]
        )
    }

    async findByName(nome) {
        const conn = await connect();
        const [rows] = await conn.query(`select * from gastos where nome = '${nome}';`)
        return rows;
    }

    async update(id, gasto) {
        const conn = await connect();
        return await conn.query(
            `UPDATE gastos SET nome = ?, tipo = ?, credito = ?, data = ?, debito = ?, motivo = ? WHERE id = ?;`,
            [gasto.nome, gasto.tipo, gasto.credito, gasto.data, gasto.debito, gasto.motivo, id]
        );
    }

    async delete(id) {
        const conn = await connect();
        return await conn.query(
            "DELETE FROM gastos WHERE id = ?", 
            [id]
        )
    }
}