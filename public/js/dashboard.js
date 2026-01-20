const USERS_API_URL = '/api/users';
const PROJECTS_API_URL = '/api/projects';
let currentUser = null;
let currentTab = 'projects'; // Default tab

// Auth & Init
function init() {
    const userStr = localStorage.getItem('pylar_user');
    if (!userStr) {
        window.location.href = '/';
        return;
    }
    currentUser = JSON.parse(userStr);

    // Security Check: Seed goes to seed.html
    if (currentUser.role === 'SuperUser') {
        window.location.href = '/seed.html';
        return;
    }

    // Role Logic
    if (currentUser.role === 'Admin') {
        document.getElementById('navUsers').classList.remove('hidden');
        // Admin defaults to Users if they want, or Projects. Let's default to Projects to match Members, or Users if preferred?
        // User asked for: "Admin sees user and projects CRUD".
        // Let's default Admin to Users as it matters more.
        currentTab = 'users';
    } else {
        // Member
        currentTab = 'projects';
    }

    // Update Header
    document.getElementById('userDisplay').textContent = currentUser.username;
    if (document.getElementById('companyDisplay')) document.getElementById('companyDisplay').textContent = currentUser.company_name || '';
    if (document.getElementById('userInitials')) document.getElementById('userInitials').textContent = currentUser.username.substring(0, 3).toUpperCase();

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
    const navUsers = document.getElementById('navUsers');
    const navProjects = document.getElementById('navProjects');

    // Reset Styles
    const activeClass = ['bg-gray-700/50', 'text-white', 'border', 'border-gray-600'];
    const inactiveClass = ['text-gray-400', 'hover:text-white', 'hover:bg-gray-700/30'];

    // Toggle Visibility
    if (tab === 'users') {
        usersSection.classList.remove('hidden');
        projectsSection.classList.add('hidden');

        navUsers.classList.add(...activeClass);
        navUsers.classList.remove(...inactiveClass);

        navProjects.classList.remove(...activeClass);
        navProjects.classList.add(...inactiveClass);

        fetchUsers();
    } else {
        projectsSection.classList.remove('hidden');
        usersSection.classList.add('hidden');

        navProjects.classList.add(...activeClass);
        navProjects.classList.remove(...inactiveClass);

        navUsers.classList.remove(...activeClass);
        navUsers.classList.add(...inactiveClass);

        fetchProjects();
    }
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
            tr.className = 'hover:bg-gray-800/50 transition-colors border-b border-gray-700/50 last:border-0';
            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-white">
                    ${user.username} 
                    ${isMe ? '<span class="ml-2 text-xs text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">(Você!)</span>' : ''}
                </td>
                <td class="px-6 py-4">
                     <span class="px-2 py-1 rounded text-xs border ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}">${user.role}</span>
                </td>
                <td class="px-6 py-4 text-gray-400">${formatDate(user.created_at)}</td>
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

function openModal(isEdit = false) {
    userModal.classList.remove('hidden');
    userModal.classList.add('flex');
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
    }
}

function closeModal() {
    userModal.classList.add('hidden');
    userModal.classList.remove('flex');
}

window.editUser = function (id, username, role) {
    userIdInput.value = id;
    usernameInput.value = username;
    roleInput.value = role;
    passwordInput.value = '';
    openModal(true);
}

window.deleteUser = async function (id) {
    if (!confirm('Excluir usuário?')) return;
    await fetchWrapper(`${USERS_API_URL}/${id}`, 'DELETE');
    fetchUsers();
}

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
            currentUser.role = body.role; // In case role changed (though usually restricted)
            localStorage.setItem('pylar_user', JSON.stringify(currentUser));

            // Update Header immediately
            document.getElementById('userDisplay').textContent = currentUser.username;
            if (document.getElementById('userInitials')) document.getElementById('userInitials').textContent = currentUser.username.substring(0, 3).toUpperCase();
        }

        closeModal();
        fetchUsers();
    }
});

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
    // Ensure ID comparison works (string vs number)
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

init();
