const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
    async createTable() {
        // Create Companies Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS companies (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create Users Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'Member',
                company_id INTEGER REFERENCES companies(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migration: Add company_id if it doesn't exist (for existing DBs)
        try {
            await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);`);
        } catch (error) {
            console.log('Column company_id might already exist or migration error:', error.message);
        }
    }

    async findByUsername(username) {
        const query = `
            SELECT u.*, c.name as company_name 
            FROM users u
            LEFT JOIN companies c ON u.company_id = c.id
            WHERE u.username = $1
        `;
        const { rows } = await db.query(query, [username]);
        return rows[0];
    }

    async createUser(username, password, role = 'Member', companyId = null) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const query = `
      INSERT INTO users (username, password_hash, role, company_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, role, company_id;
    `;
        const { rows } = await db.query(query, [username, hash, role, companyId]);
        return rows[0];
    }

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async updatePassword(username, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        const query = 'UPDATE users SET password_hash = $1 WHERE username = $2';
        await db.query(query, [hash, username]);
    }

    async findAll(companyId = null) {
        let query;
        let params = [];

        if (companyId) {
            query = `
                SELECT u.id, u.username, u.role, u.created_at, c.name as company_name 
                FROM users u
                LEFT JOIN companies c ON u.company_id = c.id
                WHERE u.company_id = $1 
                ORDER BY u.id ASC
            `;
            params = [companyId];
        } else {
            // Global View (for Seed)
            query = `
                SELECT u.id, u.username, u.role, u.created_at, c.name as company_name 
                FROM users u
                LEFT JOIN companies c ON u.company_id = c.id
                ORDER BY u.id ASC
            `;
        }

        const { rows } = await db.query(query, params);
        return rows;
    }

    async findById(id, companyId) {
        const query = 'SELECT id, username, role, created_at FROM users WHERE id = $1 AND company_id = $2';
        const { rows } = await db.query(query, [id, companyId]);
        return rows[0];
    }

    async delete(id, companyId) {
        let query;
        let params;

        if (companyId) {
            query = 'DELETE FROM users WHERE id = $1 AND company_id = $2 RETURNING id';
            params = [id, companyId];
        } else {
            // Global (SuperUser)
            query = 'DELETE FROM users WHERE id = $1 RETURNING id';
            params = [id];
        }

        const { rows } = await db.query(query, params);
        return rows[0];
    }

    async update(id, username, password, role, companyId) {
        let query;
        let params;

        // Base query parts
        let setClause = 'username = $1, role = $2';
        params = [username, role];
        let paramIndex = 3;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            setClause += `, password_hash = $${paramIndex}`;
            params.push(hash);
            paramIndex++;
        }

        // Where clause
        let whereClause = `id = $${paramIndex}`;
        params.push(id);
        paramIndex++;

        if (companyId) {
            whereClause += ` AND company_id = $${paramIndex}`;
            params.push(companyId);
        }
        // If companyId is null (SuperUser), we don't add the AND clause, effectively allowing update on any user

        query = `UPDATE users SET ${setClause} WHERE ${whereClause} RETURNING id, username, role`;

        const { rows } = await db.query(query, params);
        return rows[0];
    }
}

module.exports = new UserModel();
