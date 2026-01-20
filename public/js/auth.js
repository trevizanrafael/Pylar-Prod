document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = e.target.querySelector('button');

    // Reset state
    errorMessage.classList.add('hidden');
    usernameInput.classList.remove('border-red-500');
    passwordInput.classList.remove('border-red-500');

    // Loading state
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Entrando...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameInput.value,
                password: passwordInput.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save user info (insecure for real app, ok for MVP demo)
            localStorage.setItem('pylar_user', JSON.stringify(data.user));

            if (data.user.role === 'SuperUser') {
                window.location.href = '/dashboard.html';
            } else {
                window.location.href = '/projects.html';
            }
        } else {
            throw new Error(data.message || 'Erro ao realizar login');
        }
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
        usernameInput.classList.add('border-red-500');
        passwordInput.classList.add('border-red-500');
    } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
});
