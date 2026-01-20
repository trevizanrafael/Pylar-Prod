const db = require('../config/database');

class ProjectModel {
    async createTable() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async findAll(companyId) {
        const query = 'SELECT * FROM projects WHERE company_id = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [companyId]);
        return rows;
    }

    async findById(id, companyId) {
        const query = 'SELECT * FROM projects WHERE id = $1 AND company_id = $2';
        const { rows } = await db.query(query, [id, companyId]);
        return rows[0];
    }

    async create(name, description, companyId) {
        const query = 'INSERT INTO projects (name, description, company_id) VALUES ($1, $2, $3) RETURNING *';
        const { rows } = await db.query(query, [name, description, companyId]);
        return rows[0];
    }

    async update(id, name, description, companyId) {
        const query = 'UPDATE projects SET name = $1, description = $2 WHERE id = $3 AND company_id = $4 RETURNING *';
        const { rows } = await db.query(query, [name, description, id, companyId]);
        return rows[0];
    }

    async delete(id, companyId) {
        const query = 'DELETE FROM projects WHERE id = $1 AND company_id = $2 RETURNING *';
        const { rows } = await db.query(query, [id, companyId]);
        return rows[0];
    }
}

module.exports = new ProjectModel();
