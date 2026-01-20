const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// TODO: Add middleware to check if user is SuperUser or Admin
// For now, it is open but frontend is protected by login

router.get('/', userController.getAll);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;
