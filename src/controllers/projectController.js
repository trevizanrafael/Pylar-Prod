const projectModel = require('../models/projectModel');

class ProjectController {
    async getAll(req, res) {
        try {
            const companyId = req.headers['x-company-id'];
            if (!companyId) return res.status(400).json({ message: 'Company ID required' });

            const projects = await projectModel.findAll(companyId);
            res.json(projects);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching projects' });
        }
    }

    async getById(req, res) {
        try {
            const companyId = req.headers['x-company-id'];
            if (!companyId) return res.status(400).json({ message: 'Company ID required' });

            const { id } = req.params;
            const project = await projectModel.findById(id, companyId);

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
            res.json(project);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching project' });
        }
    }

    async create(req, res) {
        try {
            const companyId = req.headers['x-company-id'];
            if (!companyId) return res.status(400).json({ message: 'Company ID required' });

            const { name, description } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Project name is required' });
            }

            const newProject = await projectModel.create(name, description, companyId);
            res.status(201).json(newProject);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating project' });
        }
    }

    async update(req, res) {
        try {
            const companyId = req.headers['x-company-id'];
            if (!companyId) return res.status(400).json({ message: 'Company ID required' });

            const { id } = req.params;
            const { name, description } = req.body;

            const updatedProject = await projectModel.update(id, name, description, companyId);

            if (!updatedProject) {
                return res.status(404).json({ message: 'Project not found' });
            }
            res.json(updatedProject);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating project' });
        }
    }

    async delete(req, res) {
        try {
            const companyId = req.headers['x-company-id'];
            if (!companyId) return res.status(400).json({ message: 'Company ID required' });

            const { id } = req.params;
            const deleted = await projectModel.delete(id, companyId);

            if (!deleted) {
                return res.status(404).json({ message: 'Project not found' });
            }
            res.json({ message: 'Project deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting project' });
        }
    }
}

module.exports = new ProjectController();
