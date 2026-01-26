const Role = require('../models/roleModel');

const roleController = {
    async create(req, res) {
        try {
            const { name, permissions } = req.body;
            const companyId = req.headers['x-company-id'];

            if (!companyId) return res.status(400).json({ message: 'Company ID is required' });
            if (!name) return res.status(400).json({ message: 'Name is required' });

            // Validation Logic: Parent requires at least one child
            // Example structure: { users: { view: true, create: false... } }
            // If view is true, check if any other key in that object is true (assuming 'view' is the parent flag, or we treat 'view' as access)
            // The user request said: "Usuários () (caso essa opcao seja marcada... se nao... nao da acesso)"
            // So we'll expect a structure like:
            // { 
            //   users: { view: true, create: true, edit: false, delete: false },
            //   projects: { view: true, ... } 
            // }

            const modules = ['users', 'roles']; // Modules that have sub-permissions
            for (const mod of modules) {
                if (permissions[mod] && permissions[mod].view) {
                    const children = ['create', 'edit', 'delete']; // Adjust based on user request
                    const hasChild = children.some(action => permissions[mod][action]);
                    if (!hasChild) {
                        return res.status(400).json({
                            message: `Para o módulo '${mod}', você deve selecionar ao menos uma permissão (Criar, Editar ou Excluir).`
                        });
                    }
                }
            }

            const newRole = await Role.create(companyId, name, permissions);
            res.status(201).json(newRole);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating role' });
        }
    },

    async list(req, res) {
        try {
            const companyId = req.headers['x-company-id'];
            if (!companyId) return res.status(400).json({ message: 'Company ID required' });
            const roles = await Role.findByCompany(companyId);
            res.json(roles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching roles' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, permissions } = req.body;

            // Validation Logic (Same as create)
            const modules = ['users', 'roles'];
            for (const mod of modules) {
                if (permissions[mod] && permissions[mod].view) {
                    const children = ['create', 'edit', 'delete'];
                    const hasChild = children.some(action => permissions[mod][action]);
                    if (!hasChild) {
                        return res.status(400).json({
                            message: `Para o módulo '${mod}', você deve selecionar ao menos uma permissão (Criar, Editar ou Excluir).`
                        });
                    }
                }
            }

            const updatedRole = await Role.update(id, name, permissions);
            res.json(updatedRole);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating role' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            await Role.delete(id);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting role' });
        }
    }
};

module.exports = roleController;
