const userModel = require('../models/userModel');
const db = require('../config/database');
require('dotenv').config();

class AuthService {
    async initialize() {
        try {
            await userModel.createTable();

            const seedUsername = process.env.SEED_USER;
            const seedPassword = process.env.SEED_PASSWORD;

            if (seedUsername && seedPassword) {
                // Ensure System Company exists
                let systemCompany = await db.query("SELECT * FROM companies WHERE name = 'System'");
                if (systemCompany.rows.length === 0) {
                    console.log('Creating System Company...');
                    const res = await db.query("INSERT INTO companies (name) VALUES ('System') RETURNING *");
                    systemCompany = res.rows[0];
                } else {
                    systemCompany = systemCompany.rows[0];
                }

                const existingUser = await userModel.findByUsername(seedUsername);

                if (!existingUser) {
                    console.log(`Seeding admin user: ${seedUsername}`);
                    // Passthrough systemCompany.id to createUser
                    await userModel.createUser(seedUsername, seedPassword, 'SuperUser', systemCompany.id);
                } else {
                    console.log(`Seed user '${seedUsername}' found. Updates...`);
                    await userModel.updatePassword(seedUsername, seedPassword);

                    // Ensure Seed User is in System Company
                    if (!existingUser.company_id) {
                        await db.query('UPDATE users SET company_id = $1 WHERE id = $2', [systemCompany.id, existingUser.id]);
                        console.log('Linked Seed User to System Company');
                    }
                }
            } else {
                console.warn('SEED_USER or SEED_PASSWORD not found in .env. Skipping seed.');
            }
        } catch (error) {
            console.error('Failed to initialize Auth Service:', error);
        }
    }

    async login(username, password) {
        const user = await userModel.findByUsername(username);

        if (user && await userModel.verifyPassword(password, user.password_hash)) {
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    company_id: user.company_id,
                    company_name: user.company_name
                }
            };
        }

        return {
            success: false,
            message: 'Senha e usuário não correspondem.'
        };
    }
    async registerCompany(companyName, adminUsername, adminPassword) {
        // 1. Check if username already exists
        const existingUser = await userModel.findByUsername(adminUsername);
        if (existingUser) {
            return { success: false, message: 'Usuário já existe.' };
        }

        // 2. Create Company
        const companyRes = await db.query(
            "INSERT INTO companies (name) VALUES ($1) RETURNING *",
            [companyName]
        );
        const newCompany = companyRes.rows[0];

        // 3. Create Admin User for this Company
        const newUser = await userModel.createUser(
            adminUsername,
            adminPassword,
            'Admin', // Default role for company creator
            newCompany.id
        );

        return {
            success: true,
            company: newCompany,
            user: newUser
        };
    }
}

module.exports = new AuthService();
