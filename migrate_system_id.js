const db = require('./src/config/database');

async function migrate() {
    try {
        console.log('Starting migration...');

        // Find current System company
        const { rows: systems } = await db.query("SELECT id FROM companies WHERE name = 'System'");
        if (systems.length === 0) {
            console.log('System company not found. Creating with ID 0...');
            try {
                await db.query("INSERT INTO companies (id, name) VALUES (0, 'System')");
                console.log('Created System company with ID 0');
            } catch (e) {
                // If ID is serial, might need override
                await db.query("INSERT INTO companies (id, name) OVERRIDING SYSTEM VALUE VALUES (0, 'System')");
                console.log('Created System company with ID 0 (Override)');
            }
        } else {
            const currentId = systems[0].id;
            if (currentId === 0) {
                console.log('System company already has ID 0');
            } else {
                console.log(`Moving System company from ID ${currentId} to 0...`);
                // Update Users first
                await db.query("UPDATE users SET company_id = 0 WHERE company_id = $1", [currentId]);
                // Update company ID
                await db.query("UPDATE companies SET id = 0 WHERE id = $1", [currentId]);
                // Reset sequence if needed (optional)
                console.log('Migration complete.');
            }
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
