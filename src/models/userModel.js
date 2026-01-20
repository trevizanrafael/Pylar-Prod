const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
    async createTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await db.query(query);
    }

    async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await db.query(query, [username]);
        return rows[0];
    }

    async createUser(username, password, role = 'Member') {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const query = `
      INSERT INTO users (username, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, username, role;
    `;
        const { rows } = await db.query(query, [username, hash, role]);
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

    async findAll() {
        const query = 'SELECT id, username, role, created_at FROM users ORDER BY id ASC';
        const { rows } = await db.query(query);
        return rows;
    }

    async findById(id) {
        const query = 'SELECT id, username, role, created_at FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    async update(id, username, password, role) {
        let query;
        let params;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            query = 'UPDATE users SET username = $1, password_hash = $2, role = $3 WHERE id = $4 RETURNING id, username, role';
            params = [username, hash, role, id];
        } else {
            query = 'UPDATE users SET username = $1, role = $2 WHERE id = $3 RETURNING id, username, role';
            params = [username, role, id];
        }

        const { rows } = await db.query(query, params);
        return rows[0];
    }
}

module.exports = new UserModel();
