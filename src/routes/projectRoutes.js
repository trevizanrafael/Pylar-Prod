const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// All routes here are assumed to be protected by authentication 
// and require x-company-id header (handled in controller)

router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

module.exports = router;
