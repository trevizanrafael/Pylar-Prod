const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating roles table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                permissions JSONB NOT NULL DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Adding role_id column to users table...');
        // Add column if not exists
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role_id') THEN
                    ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL;
                END IF;
            END
            $$;
        `);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
