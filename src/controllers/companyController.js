const companyModel = require('../models/companyModel');

class CompanyController {
    async getAll(req, res) {
        try {
            const companies = await companyModel.findAll();
            res.json(companies);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching companies' });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const company = await companyModel.findById(id);
            if (!company) {
                return res.status(404).json({ message: 'Company not found' });
            }
            res.json(company);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching company' });
        }
    }

    async create(req, res) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Company name is required' });
            }
            const newCompany = await companyModel.create(name);
            res.status(201).json(newCompany);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating company' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Company name is required' });
            }

            // Prevent renaming System company
            const company = await companyModel.findById(id);
            if (company && (company.name === 'System' || company.id === 0)) {
                return res.status(403).json({ message: 'Cannot modify System company' });
            }

            const updatedCompany = await companyModel.update(id, name);
            if (!updatedCompany) {
                return res.status(404).json({ message: 'Company not found' });
            }
            res.json(updatedCompany);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating company' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            // Prevent deleting System company
            const company = await companyModel.findById(id);
            if (company && (company.name === 'System' || company.id === 0)) {
                return res.status(403).json({ message: 'Cannot delete System company' });
            }

            const deletedCompany = await companyModel.delete(id);
            if (!deletedCompany) {
                return res.status(404).json({ message: 'Company not found' });
            }
            res.json({ message: 'Company deleted successfully' });
        } catch (error) {
            console.error('Delete company error:', error);
            if (error.code === '23503') { // Foreign key violation code in Postgres
                return res.status(400).json({ message: 'Cannot delete company with active users. Delete users first.' });
            }
            res.status(500).json({ message: 'Error deleting company' });
        }
    }
}

module.exports = new CompanyController();
