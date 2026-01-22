const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const Role = {
    async create(companyId, name, permissions) {
        const result = await pool.query(
            'INSERT INTO roles (company_id, name, permissions) VALUES ($1, $2, $3) RETURNING *',
            [companyId, name, JSON.stringify(permissions)]
        );
        return result.rows[0];
    },

    async findByCompany(companyId) {
        const result = await pool.query('SELECT * FROM roles WHERE company_id = $1 ORDER BY name ASC', [companyId]);
        return result.rows;
    },

    async findById(id) {
        const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
        return result.rows[0];
    },

    async update(id, name, permissions) {
        const result = await pool.query(
            'UPDATE roles SET name = $1, permissions = $2 WHERE id = $3 RETURNING *',
            [name, JSON.stringify(permissions), id]
        );
        return result.rows[0];
    },

    async delete(id) {
        await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    }
};

module.exports = Role;
