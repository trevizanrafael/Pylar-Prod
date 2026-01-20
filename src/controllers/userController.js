const userModel = require('../models/userModel');

class UserController {
    async getAll(req, res) {
        try {
            const companyId = req.headers['x-company-id'];
            const userRole = req.headers['x-user-role'];

            // If SuperUser, allow global view (pass null)
            const scopeCompanyId = userRole === 'SuperUser' ? null : companyId;

            if (userRole !== 'SuperUser' && !companyId) {
                return res.status(400).json({ message: 'Company ID required' });
            }

            const users = await userModel.findAll(scopeCompanyId);
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    }

    async create(req, res) {
        try {
            const companyId = req.headers['x-company-id'];
            if (!companyId) return res.status(400).json({ message: 'Company ID required' });

            const { username, password, role } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }

            const existingUser = await userModel.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            const newUser = await userModel.createUser(username, password, role, companyId);
            res.status(201).json(newUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }

    async update(req, res) {
        try {
            const companyId = req.headers['x-company-id'];
            const userRole = req.headers['x-user-role'];

            if (userRole !== 'SuperUser' && !companyId) {
                return res.status(400).json({ message: 'Company ID required' });
            }

            const { id } = req.params;
            const { username, password, role } = req.body;

            // Protect Seed User
            const targetUser = await userModel.findById(id, null);
            if (targetUser && targetUser.role === 'SuperUser') {
                // Allow password update? Maybe, but definitely not role degradation
                if (role !== 'SuperUser') {
                    return res.status(403).json({ message: 'Cannot change SuperUser role' });
                }
                // Optional: Prevent username change too if desired
            }

            // If SuperUser, pass null as companyId to allow global update
            const scopeCompanyId = userRole === 'SuperUser' ? null : companyId;

            // Allow updating without password
            const updatedUser = await userModel.update(id, username, password, role, scopeCompanyId);

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(updatedUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating user' });
        }
    }

    async delete(req, res) {
        try {
            const companyId = req.headers['x-company-id'];
            const userRole = req.headers['x-user-role'];

            if (userRole !== 'SuperUser' && !companyId) {
                return res.status(400).json({ message: 'Company ID required' });
            }

            const { id } = req.params;

            // Protect Seed User (ID 1 usually, or role SuperUser check)
            // Best to check if target user is SuperUser
            const targetUser = await userModel.findById(id, null); // null companyId to find global
            if (targetUser && targetUser.role === 'SuperUser') {
                return res.status(403).json({ message: 'Cannot delete SuperUser' });
            }

            // Prevent Self-Deletion
            const requestingUserId = req.headers['x-requesting-user-id'];
            if (requestingUserId && parseInt(requestingUserId) === parseInt(id)) {
                return res.status(403).json({ message: 'You cannot delete yourself' });
            }

            // If SuperUser, pass null as companyId to allow global delete
            const scopeCompanyId = userRole === 'SuperUser' ? null : companyId;

            const deleted = await userModel.delete(id, scopeCompanyId);

            if (!deleted) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting user' });
        }
    }
}

module.exports = new UserController();
