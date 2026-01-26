const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debug() {
    const client = await pool.connect();
    try {
        console.log('--- USERS ---');
        const users = await client.query('SELECT id, username, role, company_id FROM users');
        console.table(users.rows);

        console.log('\n--- ROLES ---');
        const roles = await client.query('SELECT id, company_id, name, permissions FROM roles');
        roles.rows.forEach(r => {
            console.log(`Role: ${r.name} (Company: ${r.company_id})`);
            console.log('Permissions:', JSON.stringify(r.permissions, null, 2));
            console.log('---');
        });

    } catch (err) {
        console.error('Debug failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

debug();
