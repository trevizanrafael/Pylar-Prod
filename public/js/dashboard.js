const USERS_API_URL = '/api/users';
const PROJECTS_API_URL = '/api/projects';
const ROLES_API_URL = '/api/roles';

let currentUser = null;
let currentTab = 'projects';

// --- Auth & Init ---
function init() {
    const userStr = localStorage.getItem('pylar_user');
    if (!userStr) {
        window.location.href = '/';
        return;
    }
    currentUser = JSON.parse(userStr);
    console.log("DEBUG: Current User:", currentUser);
    console.log("DEBUG: Permissions:", currentUser.permissions);

    if (currentUser.role === 'SuperUser') {
        window.location.href = '/seed.html';
        return;
    }

    // Sidebar Visibility Logic
    let p = currentUser.permissions || {};
    if (typeof p === 'string') {
        try { p = JSON.parse(p); } catch (e) { console.error('Failed to parse permissions', e); p = {}; }
    }
    console.log("DEBUG: Sidebar Check - Role:", currentUser.role, "Users View:", p.users?.view, "Roles View:", p.roles?.view);

    // Users Link
    if (currentUser.role === 'Admin' || p.users?.view) {
        const navUsers = document.getElementById('navUsers');
        if (navUsers) navUsers.classList.remove('hidden');
    }

    // Roles Link
    if (currentUser.role === 'Admin' || p.roles?.view) {
        const navRoles = document.getElementById('navRoles');
        if (navRoles) navRoles.classList.remove('hidden');
    }

    // Default Tab
    if (currentUser.role === 'Admin') {
        currentTab = 'users';
    } else {
        currentTab = 'projects';
    }

    // Update Header
    document.getElementById('userDisplay').textContent = currentUser.username;
    const companyDisplay = document.getElementById('companyDisplay');
    if (companyDisplay) companyDisplay.textContent = currentUser.company_name || '';

    const userInitials = document.getElementById('userInitials');
    if (userInitials) userInitials.textContent = currentUser.username.substring(0, 3).toUpperCase();

    switchTab(currentTab);
}

function logout() {
    localStorage.removeItem('pylar_user');
    window.location.href = '/';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function switchTab(tab) {
    currentTab = tab;
    const usersSection = document.getElementById('usersSection');
    const projectsSection = document.getElementById('projectsSection');
    const rolesSection = document.getElementById('rolesSection');

    const navUsers = document.getElementById('navUsers');
    const navProjects = document.getElementById('navProjects');
    const navRoles = document.getElementById('navRoles');

    // Helper: Toggle active class
    const setActive = (el, active) => {
        if (!el) return;
        // The 'nav-item-active' class is defined in dashboard.html styles
        const activeClass = ['nav-item-active'];
        const inactiveClass = ['text-slate-400', 'hover:text-white', 'hover:bg-white/5'];

        if (active) {
            el.classList.add(...activeClass);
            el.classList.remove(...inactiveClass);
        } else {
            el.classList.remove(...activeClass);
            el.classList.add(...inactiveClass);
        }
    };

    // Hide all
    if (usersSection) usersSection.classList.add('hidden');
    if (projectsSection) projectsSection.classList.add('hidden');
    if (rolesSection) rolesSection.classList.add('hidden');

    setActive(navUsers, false);
    setActive(navProjects, false);
    setActive(navRoles, false);

    // Show selected
    if (tab === 'users') {
        if (usersSection) usersSection.classList.remove('hidden');
        setActive(navUsers, true);
        fetchUsers();
    } else if (tab === 'projects') {
        if (projectsSection) projectsSection.classList.remove('hidden');
        setActive(navProjects, true);
        fetchProjects();
    } else if (tab === 'roles') {
        if (rolesSection) rolesSection.classList.remove('hidden');
        setActive(navRoles, true);
        fetchRoles();
    }
}

// --- Roles Logic ---
async function fetchRoles() {
    try {
        const res = await fetchWrapper(ROLES_API_URL, 'GET');
        if (!res) return;

        const tbody = document.getElementById('rolesTableBody');
        tbody.innerHTML = '';
        if (!tbody) return;

        res.forEach(role => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5 last:border-0';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-white">${role.name}</td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick='editRole(${JSON.stringify(role)})' class="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">Editar</button>
                    <button onclick="deleteRole(${role.id})" class="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
    }
}

const roleModal = document.getElementById('roleModal');
const roleForm = document.getElementById('roleForm');
const roleModalTitle = document.getElementById('roleModalTitle');
const roleIdInput = document.getElementById('roleId');
const roleNameInput = document.getElementById('roleName');

window.openRoleModal = function (isEdit = false) {
    if (!roleModal) return;
    roleModal.classList.remove('hidden');
    roleModal.classList.add('flex');
    if (!isEdit) {
        roleModalTitle.textContent = 'Novo Cargo';
        roleForm.reset();
        roleIdInput.value = '';
        const chUsers = document.getElementById('children_users');
        if (chUsers) chUsers.classList.add('hidden');
        const chRoles = document.getElementById('children_roles');
        if (chRoles) chRoles.classList.add('hidden');
    } else {
        roleModalTitle.textContent = 'Editar Cargo';
    }
}

window.closeRoleModal = function () {
    if (!roleModal) return;
    roleModal.classList.add('hidden');
    roleModal.classList.remove('flex');
}

window.toggleChildren = function (module) {
    const parent = document.getElementById(`perm_${module}_view`);
    const childrenDiv = document.getElementById(`children_${module}`);
    if (!parent || !childrenDiv) return;

    if (parent.checked) {
        childrenDiv.classList.remove('hidden');
    } else {
        childrenDiv.classList.add('hidden');
        childrenDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    }
}

window.editRole = function (role) {
    roleIdInput.value = role.id;
    roleNameInput.value = role.name;
    const p = role.permissions || {};

    // Projects (Always View)
    // setCheck('perm_projects_view', !!p.projects?.view); // Element removed from HTML
    setCheck('perm_projects_create', !!p.projects?.create);
    setCheck('perm_projects_edit', !!p.projects?.edit);
    setCheck('perm_projects_delete', !!p.projects?.delete);

    // Users
    setCheck('perm_users_view', !!p.users?.view);
    const chUsers = document.getElementById('children_users');
    if (p.users?.view) chUsers.classList.remove('hidden');
    else chUsers.classList.add('hidden');
    setCheck('perm_users_create', !!p.users?.create);
    setCheck('perm_users_edit', !!p.users?.edit);
    setCheck('perm_users_delete', !!p.users?.delete);

    // Roles
    setCheck('perm_roles_view', !!p.roles?.view);
    const chRoles = document.getElementById('children_roles');
    if (p.roles?.view) chRoles.classList.remove('hidden');
    else chRoles.classList.add('hidden');
    setCheck('perm_roles_create', !!p.roles?.create);
    setCheck('perm_roles_edit', !!p.roles?.edit);
    setCheck('perm_roles_delete', !!p.roles?.delete);

    openRoleModal(true);
}

function setCheck(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = val;
}

function getCheck(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

window.deleteRole = async function (id) {
    if (!confirm('Excluir cargo?')) return;
    await fetchWrapper(`${ROLES_API_URL}/${id}`, 'DELETE');
    fetchRoles();
}

if (roleForm) {
    roleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = roleIdInput.value;
        const permissions = {
            projects: {
                view: true, // Always true
                create: getCheck('perm_projects_create'),
                edit: getCheck('perm_projects_edit'),
                delete: getCheck('perm_projects_delete')
            },
            users: {
                view: getCheck('perm_users_view'),
                create: getCheck('perm_users_create'),
                edit: getCheck('perm_users_edit'),
                delete: getCheck('perm_users_delete')
            },
            roles: {
                view: getCheck('perm_roles_view'),
                create: getCheck('perm_roles_create'),
                edit: getCheck('perm_roles_edit'),
                delete: getCheck('perm_roles_delete')
            }
        };

        const body = { name: roleNameInput.value, permissions };
        const res = await fetchWrapper(id ? `${ROLES_API_URL}/${id}` : ROLES_API_URL, id ? 'PUT' : 'POST', body);
        if (res) {
            closeRoleModal();
            fetchRoles();
        }
    });
}

// --- Users Logic ---
async function fetchUsers() {
    try {
        const res = await fetch(USERS_API_URL, {
            headers: {
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role
            }
        });
        const users = await res.json();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const isMe = user.username === currentUser.username;
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5 last:border-0';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-white">
                    ${user.username} 
                    ${isMe ? '<span class="ml-2 text-xs text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">(Você!)</span>' : ''}
                </td>
                <td class="px-6 py-4">
                     <span class="px-2 py-1 rounded text-xs border ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}">${user.role}</span>
                </td>
                <td class="px-6 py-4 text-slate-400">${formatDate(user.created_at)}</td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="editUser(${user.id}, '${user.username}', '${user.role}')" class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">Editar</button>
                    ${!isMe ? `<button onclick="deleteUser(${user.id})" class="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Excluir</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// --- Projects Logic ---
let currentProjects = [];

async function fetchProjects() {
    try {
        const res = await fetch(PROJECTS_API_URL, {
            headers: {
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role
            }
        });
        currentProjects = await res.json();
        const grid = document.getElementById('projectsGrid');
        grid.innerHTML = '';

        currentProjects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors group relative flex flex-col';

            // Parse Markdown (handle empty/null)
            const descriptionHtml = project.description ? marked.parse(project.description) : '<p class="text-slate-500 italic">Sem descrição.</p>';

            card.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                         <div class="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-white">${project.name}</h3>
                    </div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onclick="editProject(${project.id})" class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors" title="Editar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                         </button>
                         <button onclick="deleteProject(${project.id})" class="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors" title="Excluir">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                         </button>
                    </div>
                </div>
                
                <div class="prose prose-invert prose-sm max-w-none text-slate-300">
                    ${descriptionHtml}
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

// --- Modal & CRUD Wrappers ---
const userModal = document.getElementById('userModal');
const userForm = document.getElementById('userForm');
const userModalTitle = document.getElementById('modalTitle');
const userIdInput = document.getElementById('userId');
const usernameInput = document.getElementById('formUsername');
const passwordInput = document.getElementById('formPassword');
const roleInput = document.getElementById('formRole');
const passwordHint = document.getElementById('passwordHint');

async function openModal(isEdit = false) {
    userModal.classList.remove('hidden');
    userModal.classList.add('flex');

    // Populate Roles Logic
    const roleSelect = document.getElementById('formRole');
    roleSelect.innerHTML = '<option value="">Carregando...</option>';

    try {
        const rolesRes = await fetchWrapper(ROLES_API_URL, 'GET');
        roleSelect.innerHTML = ''; // Clear loading

        // 1. Admin (Always available)
        const adminOpt = document.createElement('option');
        adminOpt.value = 'Admin';
        adminOpt.textContent = 'Admin (Acesso Total)';
        roleSelect.appendChild(adminOpt);

        // 2. Dynamic Roles
        if (rolesRes && Array.isArray(rolesRes)) {
            rolesRes.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.name; // Using name as the key for now, backend maps it
                opt.textContent = r.name;
                roleSelect.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Error fetching roles for modal", e);
        roleSelect.innerHTML = '<option value="Admin">Admin (Fallback)</option>';
    }

    if (!isEdit) {
        userModalTitle.textContent = 'Novo Usuário';
        userForm.reset();
        userIdInput.value = '';
        passwordHint.classList.add('hidden');
        passwordInput.required = true;
    } else {
        userModalTitle.textContent = 'Editar Usuário';
        passwordHint.classList.remove('hidden');
        passwordInput.required = false;
        // Restore selected role after population (if editUser called before this finished, handled by local var capture or re-assignment? 
        // Actually editUser sets values synchronously, but fetch is async. We might need to set it again or pass it.)
    }
}

function closeModal() {
    userModal.classList.add('hidden');
    userModal.classList.remove('flex');
}

window.editUser = async function (id, username, role) {
    await openModal(true); // Wait for roles to populate
    userIdInput.value = id;
    usernameInput.value = username;
    roleInput.value = role;
    passwordInput.value = '';
}

window.deleteUser = async function (id) {
    if (!confirm('Excluir usuário?')) return;
    await fetchWrapper(`${USERS_API_URL}/${id}`, 'DELETE');
    fetchUsers();
}

if (userForm) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = userIdInput.value;
        const body = { username: usernameInput.value, role: roleInput.value };
        if (passwordInput.value) body.password = passwordInput.value;

        const res = await fetchWrapper(id ? `${USERS_API_URL}/${id}` : USERS_API_URL, id ? 'PUT' : 'POST', body);
        if (res) {
            // Check if we updated ourselves
            if (id && parseInt(id) === currentUser.id) {
                currentUser.username = body.username;
                currentUser.role = body.role; // In case role changed
                localStorage.setItem('pylar_user', JSON.stringify(currentUser));

                // Update Header immediately
                document.getElementById('userDisplay').textContent = currentUser.username;
                if (document.getElementById('userInitials')) document.getElementById('userInitials').textContent = currentUser.username.substring(0, 3).toUpperCase();
            }

            closeModal();
            fetchUsers();
        }
    });
}

// Project Modal
const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
const projectModalTitle = document.getElementById('projectModalTitle');
const projectIdInput = document.getElementById('projectId');
const projectNameInput = document.getElementById('projectFormName');
const projectDescInput = document.getElementById('projectFormDescription');

window.openProjectModal = function (isEdit = false) {
    projectModal.classList.remove('hidden');
    projectModal.classList.add('flex');
    if (!isEdit) {
        projectModalTitle.textContent = 'Novo Projeto';
        projectForm.reset();
        projectIdInput.value = '';
    } else {
        projectModalTitle.textContent = 'Editar Projeto';
    }
}

window.closeProjectModal = function () {
    projectModal.classList.add('hidden');
    projectModal.classList.remove('flex');
}

window.editProject = function (id) {
    const project = currentProjects.find(p => p.id == id);
    if (!project) return;

    projectIdInput.value = project.id;
    projectNameInput.value = project.name;
    projectDescInput.value = project.description || '';
    openProjectModal(true);
}

window.deleteProject = async function (id) {
    if (!confirm('Excluir projeto?')) return;
    await fetchWrapper(`${PROJECTS_API_URL}/${id}`, 'DELETE');
    fetchProjects();
}

if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = projectIdInput.value;
        const body = { name: projectNameInput.value, description: projectDescInput.value };

        const res = await fetchWrapper(id ? `${PROJECTS_API_URL}/${id}` : PROJECTS_API_URL, id ? 'PUT' : 'POST', body);
        if (res) {
            closeProjectModal();
            fetchProjects();
        }
    });
}

// Helper
async function fetchWrapper(url, method, body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role,
                'x-requesting-user-id': currentUser.id
            }
        };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(url, options);
        if (res.status === 204) return true;

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'Erro na operação');
            return null;
        }
        return data;
    } catch (e) {
        console.error(e);
        alert('Erro de conexão');
        return null;
    }
}

// Global Exports
window.switchTab = switchTab;
window.logout = logout;
window.openModal = openModal;
window.closeModal = closeModal;
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.openRoleModal = openRoleModal;
window.closeRoleModal = closeRoleModal;
window.editRole = editRole;

init();
