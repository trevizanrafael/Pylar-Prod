const userModel = require('../models/userModel');

class UserController {
    async getAll(req, res) {
        try {
            const users = await userModel.findAll();
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    }

    async create(req, res) {
        try {
            const { username, password, role } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }

            const existingUser = await userModel.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            const newUser = await userModel.createUser(username, password, role);
            res.status(201).json(newUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { username, password, role } = req.body;

            // Allow updating without password
            const updatedUser = await userModel.update(id, username, password, role);

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
            const { id } = req.params;
            const deleted = await userModel.delete(id);

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
