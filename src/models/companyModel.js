const db = require('../config/database');

class CompanyModel {
    async findAll() {
        const query = 'SELECT * FROM companies ORDER BY id ASC';
        const { rows } = await db.query(query);
        return rows;
    }

    async findById(id) {
        const query = 'SELECT * FROM companies WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    async create(name) {
        const query = 'INSERT INTO companies (name) VALUES ($1) RETURNING *';
        const { rows } = await db.query(query, [name]);
        return rows[0];
    }

    async update(id, name) {
        const query = 'UPDATE companies SET name = $1 WHERE id = $2 RETURNING *';
        const { rows } = await db.query(query, [name, id]);
        return rows[0];
    }

    async delete(id) {
        // Warning: This might fail if there are FK constraints (users linked to company)
        // For MVP, we might want to cascade or restrict. 
        // Let's assume restriction by default from DB, but maybe we want to delete users too?
        // For now, simple delete.
        const query = 'DELETE FROM companies WHERE id = $1 RETURNING *';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = new CompanyModel();
