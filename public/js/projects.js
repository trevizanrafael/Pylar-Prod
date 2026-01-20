const currentUser = JSON.parse(localStorage.getItem('pylar_user'));

if (!currentUser) {
    window.location.href = '/';
}

document.getElementById('userDisplay').textContent = currentUser.username;
if (document.getElementById('companyDisplay')) {
    document.getElementById('companyDisplay').textContent = currentUser.company_name || '';
}

function logout() {
    localStorage.removeItem('pylar_user');
    window.location.href = '/';
}
