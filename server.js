require('dotenv').config();
const app = require('./src/app');
const authService = require('./src/services/authService');

const PORT = process.env.PORT || 3000;

(async () => {
    // Initialize Auth Service (check DB connection and seed user)
    await authService.initialize();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Access: http://localhost:${PORT}`);
    });
})();
