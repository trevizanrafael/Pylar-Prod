const API_URL = '/api/users';
let currentUser = null;

// Auth Check
function checkAuth() {
    const userStr = localStorage.getItem('pylar_user');
    if (!userStr) {
        window.location.href = '/';
        return;
    }
    currentUser = JSON.parse(userStr);
    document.getElementById('userDisplay').textContent = currentUser.username;
    if (document.getElementById('companyDisplay')) {
        document.getElementById('companyDisplay').textContent = currentUser.company_name || '';
    }
    document.getElementById('roleDisplay').textContent = currentUser.role;
}

function logout() {
    localStorage.removeItem('pylar_user');
    window.location.href = '/';
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// Fetch and Render Users
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
            // Separate Seed User (SuperUser)
            if (user.role === 'SuperUser') {
                const seedDisplay = document.getElementById('seedUserDisplay');
                if (seedDisplay) seedDisplay.textContent = user.username;
                return; // Skip rendering in table
            }

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-800/30 transition-colors';
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
                        class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">Editar</button>
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

// Modal Logic
const modal = document.getElementById('userModal');
const form = document.getElementById('userForm');
const modalTitle = document.getElementById('modalTitle');
const userIdInput = document.getElementById('userId');
const usernameInput = document.getElementById('formUsername');
const passwordInput = document.getElementById('formPassword');
const roleInput = document.getElementById('formRole');
const passwordHint = document.getElementById('passwordHint');

function openModal(isEdit = false) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (!isEdit) {
        modalTitle.textContent = 'Novo Usuário';
        form.reset();
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
    modal.classList.add('hidden');
    modal.classList.remove('flex');
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
        if (res.ok) {
            fetchUsers();
        } else {
            alert('Erro ao excluir usuário');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao excluir usuário');
    }
};

// Form Submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = userIdInput.value;
    const username = usernameInput.value;
    const password = passwordInput.value;
    const role = roleInput.value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    const body = { username, role };
    if (password) body.password = password;

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

// Init
checkAuth();

// RBAC: Allow SuperUser AND Admin
if (currentUser.role !== 'SuperUser' && currentUser.role !== 'Admin') {
    window.location.href = '/projects.html';
} else {
    fetchUsers();
}

// Ensure logout is available globally
window.logout = logout;
