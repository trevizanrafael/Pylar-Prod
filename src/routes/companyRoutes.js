const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Middleware to ensure SuperUser access
const ensureSuperUser = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'SuperUser') {
        return res.status(403).json({ message: 'Access denied: SuperUser only' });
    }
    next();
};

router.use(ensureSuperUser);

router.get('/', companyController.getAll);
router.get('/:id', companyController.getById);
router.post('/', companyController.create);
router.put('/:id', companyController.update);
router.delete('/:id', companyController.delete);

module.exports = router;
