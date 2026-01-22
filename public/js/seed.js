const API_URL = '/api/users';
const COMPANY_API_URL = '/api/companies';
let currentUser = null;

// Auth Check
function checkAuth() {
    const userStr = localStorage.getItem('pylar_user');
    if (!userStr) {
        window.location.href = '/';
        return;
    }
    currentUser = JSON.parse(userStr);

    // Security: Only SuperUser allowed
    if (currentUser.role !== 'SuperUser') {
        window.location.href = '/projects.html';
        return;
    }

    document.getElementById('userDisplay').textContent = currentUser.username;
    if (document.getElementById('companyDisplay')) {
        document.getElementById('companyDisplay').textContent = currentUser.company_name || '';
    }
    document.getElementById('roleDisplay').textContent = currentUser.role;

    // Load initial data
    fetchUsers();
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

// --- Tabs Logic ---
function switchTab(tab) {
    const tabUsers = document.getElementById('tabUsers');
    const tabCompanies = document.getElementById('tabCompanies');
    const usersSection = document.getElementById('usersSection');
    const companiesSection = document.getElementById('companiesSection');

    if (tab === 'users') {
        tabUsers.classList.add('text-white', 'border-b-2', 'border-cyan-500');
        tabUsers.classList.remove('text-slate-400');
        tabCompanies.classList.remove('text-white', 'border-b-2', 'border-cyan-500');
        tabCompanies.classList.add('text-slate-400');

        usersSection.classList.remove('hidden');
        companiesSection.classList.add('hidden');
        fetchUsers();
    } else {
        tabCompanies.classList.add('text-white', 'border-b-2', 'border-cyan-500');
        tabCompanies.classList.remove('text-slate-400');
        tabUsers.classList.remove('text-white', 'border-b-2', 'border-cyan-500');
        tabUsers.classList.add('text-slate-400');

        companiesSection.classList.remove('hidden');
        usersSection.classList.add('hidden');
        fetchCompanies();
    }
}

// --- Users Management ---
async function fetchUsers() {
    try {
        const res = await fetch(API_URL, {
            headers: {
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role
            }
        });
        const users = await res.json();

        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            if (user.role === 'SuperUser') {
                // Update seed display if needed
                if (document.getElementById('seedUserDisplay')) document.getElementById('seedUserDisplay').textContent = user.username;
                return;
            }

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5 last:border-0';
            tr.innerHTML = `
                <td class="px-6 py-4 font-mono text-slate-500">#${user.id}</td>
                <td class="px-6 py-4 font-medium text-white">${user.username}</td>
                <td class="px-6 py-4 text-slate-400 text-xs">${user.company_name || 'Sistema'}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-slate-700/50 rounded text-xs border border-slate-600">${user.role}</span>
                </td>
                <td class="px-6 py-4">${formatDate(user.created_at)}</td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="editUser(${user.id}, '${user.username}', '${user.role}')" 
                        class="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">Editar</button>
                    ${user.username !== currentUser.username ? `
                    <button onclick="deleteUser(${user.id})" 
                        class="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Excluir</button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Erro ao carregar usuários.');
    }
}

// --- Companies Management ---
async function fetchCompanies() {
    try {
        const res = await fetch(COMPANY_API_URL, {
            headers: {
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role
            }
        });
        const companies = await res.json();

        const tbody = document.getElementById('companiesTableBody');
        tbody.innerHTML = '';

        companies.forEach(company => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5 last:border-0';
            tr.innerHTML = `
                <td class="px-6 py-4 font-mono text-slate-500">#${company.id}</td>
                <td class="px-6 py-4 font-medium text-white">${company.name}</td>
                <td class="px-6 py-4">${formatDate(company.created_at)}</td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="editCompany(${company.id}, '${company.name}')" 
                        class="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">Editar</button>
                    ${company.name !== 'System' ? `
                    <button onclick="deleteCompany(${company.id})" 
                        class="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Excluir</button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        alert('Erro ao carregar empresas.');
    }
}


// --- User Modal Logic ---
const userModal = document.getElementById('userModal');
const userForm = document.getElementById('userForm');
const modalTitle = document.getElementById('modalTitle');
const userIdInput = document.getElementById('userId');
const usernameInput = document.getElementById('formUsername');
const passwordInput = document.getElementById('formPassword');
const roleInput = document.getElementById('formRole');
const passwordHint = document.getElementById('passwordHint');

function openModal(isEdit = false) {
    userModal.classList.remove('hidden');
    userModal.classList.add('flex');
    if (!isEdit) {
        modalTitle.textContent = 'Novo Usuário';
        userForm.reset();
        userIdInput.value = '';
        passwordHint.classList.add('hidden');
        passwordInput.required = true;
    } else {
        modalTitle.textContent = 'Editar Usuário';
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
};

window.deleteUser = async function (id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role
            }
        });
        if (res.ok) fetchUsers();
        else alert('Erro ao excluir usuário');
    } catch (error) {
        console.error(error);
        alert('Erro ao excluir usuário');
    }
};

userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = userIdInput.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;
    const body = {
        username: usernameInput.value,
        role: roleInput.value
    };
    if (passwordInput.value) body.password = passwordInput.value;

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
            closeModal();
            fetchUsers();
        } else {
            alert(data.message || 'Erro ao salvar usuário');
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão');
    }
});

// --- Company Modal Logic ---
const companyModal = document.getElementById('companyModal');
const companyForm = document.getElementById('companyForm');
const companyModalTitle = document.getElementById('companyModalTitle');
const companyIdInput = document.getElementById('companyId');
const companyNameInput = document.getElementById('formCompanyName');

window.openCompanyModal = function (isEdit = false) {
    companyModal.classList.remove('hidden');
    companyModal.classList.add('flex');
    if (!isEdit) {
        companyModalTitle.textContent = 'Nova Empresa';
        companyForm.reset();
        companyIdInput.value = '';
    } else {
        companyModalTitle.textContent = 'Editar Empresa';
    }
}

window.closeCompanyModal = function () {
    companyModal.classList.add('hidden');
    companyModal.classList.remove('flex');
}

window.editCompany = function (id, name) {
    companyIdInput.value = id;
    companyNameInput.value = name;
    openCompanyModal(true);
}

window.deleteCompany = async function (id) {
    if (!confirm('Tem certeza? Isso pode falhar se a empresa tiver usuários.')) return;
    try {
        const res = await fetch(`${COMPANY_API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role
            }
        });
        const data = await res.json();
        if (res.ok) {
            fetchCompanies();
        } else {
            alert(data.message || 'Erro ao excluir empresa');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao excluir empresa');
    }
}

companyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = companyIdInput.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${COMPANY_API_URL}/${id}` : COMPANY_API_URL;

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role
            },
            body: JSON.stringify({ name: companyNameInput.value })
        });
        const data = await res.json();
        if (res.ok) {
            closeCompanyModal();
            fetchCompanies();
        } else {
            alert(data.message || 'Erro ao salvar empresa');
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão');
    }
});

// Init
checkAuth();
window.logout = logout;
window.switchTab = switchTab;
