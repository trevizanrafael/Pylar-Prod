const userModel = require('../models/userModel');
require('dotenv').config();

class AuthService {
    async initialize() {
        try {
            await userModel.createTable();

            const seedUsername = process.env.SEED_USER;
            const seedPassword = process.env.SEED_PASSWORD;

            if (seedUsername && seedPassword) {
                const existingUser = await userModel.findByUsername(seedUsername);

                if (!existingUser) {
                    console.log(`Seeding admin user: ${seedUsername}`);
                    await userModel.createUser(seedUsername, seedPassword, 'SuperUser');
                } else {
                    console.log(`Seed user '${seedUsername}' found. Updating password from .env...`);
                    await userModel.updatePassword(seedUsername, seedPassword);
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
                    role: user.role
                }
            };
        }

        return {
            success: false,
            message: 'Invalid credentials'
        };
    }
}

module.exports = new AuthService();
