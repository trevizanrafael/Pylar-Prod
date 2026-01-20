const API_URL = '/api/projects';
let currentUser = null;

// Auth & Init
function init() {
    const userStr = localStorage.getItem('pylar_user');
    if (!userStr) {
        window.location.href = '/';
        return;
    }
    currentUser = JSON.parse(userStr);

    // Update Sidebar/Header Info
    document.getElementById('userDisplay').textContent = currentUser.username;
    if (document.getElementById('companyDisplay')) document.getElementById('companyDisplay').textContent = currentUser.company_name || '';
    if (document.getElementById('userInitials')) document.getElementById('userInitials').textContent = currentUser.username.substring(0, 3).toUpperCase();

    // Show "Usuários" link only if Admin
    if (currentUser.role === 'Admin') {
        document.getElementById('navUsers').classList.remove('hidden');
    }

    fetchProjects();
}

function logout() {
    localStorage.removeItem('pylar_user');
    window.location.href = '/';
}

// Fetch Projects
async function fetchProjects() {
    try {
        const res = await fetch(API_URL, {
            headers: {
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role
            }
        });
        const projects = await res.json();
        renderProjects(projects);
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao carregar projetos');
    }
}

function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors group relative';
        card.innerHTML = `
            <div class="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">${project.name}</h3>
            <p class="text-sm text-slate-400 mb-4 line-clamp-2">${project.description || 'Sem descrição.'}</p>
            <div class="flex justify-end gap-2 mt-auto">
                <button onclick="editProject(${project.id}, '${project.name}', '${project.description || ''}')" class="text-blue-400 hover:text-blue-300 text-xs uppercase font-bold tracking-wider">Editar</button>
                <button onclick="deleteProject(${project.id})" class="text-red-400 hover:text-red-300 text-xs uppercase font-bold tracking-wider">Excluir</button>
            </div>
        `;
        grid.appendChild(card);
    });
}


// Modal Logic
const modal = document.getElementById('projectModal');
const form = document.getElementById('projectForm');
const modalTitle = document.getElementById('modalTitle');
const projectIdInput = document.getElementById('projectId');
const nameInput = document.getElementById('formName');
const descInput = document.getElementById('formDescription');

window.openProjectModal = function (isEdit = false) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (!isEdit) {
        modalTitle.textContent = 'Novo Projeto';
        form.reset();
        projectIdInput.value = '';
    } else {
        modalTitle.textContent = 'Editar Projeto';
    }
}

window.closeProjectModal = function () {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

window.editProject = function (id, name, description) {
    projectIdInput.value = id;
    nameInput.value = name;
    descInput.value = description;
    openProjectModal(true);
}

window.deleteProject = async function (id) {
    if (!confirm("Excluir projeto?")) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'x-company-id': currentUser.company_id,
                'x-user-role': currentUser.role
            }
        });
        if (res.ok) fetchProjects();
        else alert('Erro ao excluir');
    } catch (e) { console.error(e); }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = projectIdInput.value;
    const body = {
        name: nameInput.value,
        description: descInput.value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

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

        if (res.ok) {
            closeProjectModal();
            fetchProjects();
        } else {
            alert('Erro ao salvar projeto');
        }
    } catch (e) { console.error(e); }
});

init();
window.logout = logout;
