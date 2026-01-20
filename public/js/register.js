document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const companyNameInput = document.getElementById('companyName');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = e.target.querySelector('button');

    // Reset state
    errorMessage.classList.add('hidden');

    // Loading state
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Criando...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyName: companyNameInput.value,
                username: usernameInput.value,
                password: passwordInput.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Empresa criada com sucesso! Faça login para continuar.');
            window.location.href = '/';
        } else {
            throw new Error(data.message || 'Erro ao criar empresa');
        }
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
});
