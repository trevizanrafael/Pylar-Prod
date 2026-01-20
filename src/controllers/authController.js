const authService = require('../services/authService');

class AuthController {
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }

            const result = await authService.login(username, password);

            if (result.success) {
                // In a real app, we would generate a JWT token here
                return res.status(200).json({
                    message: 'Login successful',
                    user: result.user,
                    // token: 'mock-token' 
                });
            } else {
                return res.status(401).json({ message: result.message });
            }
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async register(req, res) {
        try {
            const { companyName, username, password } = req.body;

            if (!companyName || !username || !password) {
                return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
            }

            const result = await authService.registerCompany(companyName, username, password);

            if (result.success) {
                return res.status(201).json({
                    message: 'Empresa registrada com sucesso!',
                    company: result.company,
                    user: result.user
                });
            } else {
                return res.status(400).json({ message: result.message });
            }
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ message: 'Erro interno ao registrar empresa.' });
        }
    }
}

module.exports = new AuthController();
