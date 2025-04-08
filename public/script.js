document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const profileSection = document.getElementById('profile-section');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const errorMessage = document.getElementById('error-message');
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const refreshDataBtn = document.getElementById('refresh-data');

    // Проверка авторизации
    checkAuth();

    // Загрузка темы из cookie
    loadTheme();

    // Загрузка данных
    updateData();
    setInterval(updateData, 5000); // автообновление

    // ======= Авторизация =======
    loginBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                checkAuth();
            } else {
                showError('Неверные учетные данные');
            }
        } catch (err) {
            showError('Ошибка соединения');
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                authSection.classList.remove('hidden');
                profileSection.classList.add('hidden');
            }
        } catch (err) {
            showError('Ошибка при выходе');
        }
    });

    async function checkAuth() {
        try {
            const response = await fetch('/check-auth', {
                credentials: 'include'
            });

            const data = await response.json();

            if (data.authenticated) {
                document.getElementById('username-display').textContent = data.user.username;
                authSection.classList.add('hidden');
                profileSection.classList.remove('hidden');
            }
        } catch (err) {
            console.error('Ошибка проверки авторизации:', err);
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 3000);
    }

    // ======= Темы =======
    toggleThemeBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.body.setAttribute('data-theme', newTheme);

        fetch('/theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: newTheme })
        });
    });

    function loadTheme() {
        const themeCookie = document.cookie.split('; ')
            .find(row => row.startsWith('theme='));

        if (themeCookie) {
            const theme = themeCookie.split('=')[1];
            document.body.setAttribute('data-theme', theme);
        }
    }

    // ======= Обновление данных =======
    refreshDataBtn.addEventListener('click', updateData);

    async function updateData() {
        try {
            const response = await fetch('/api/data');
            const data = await response.json();

            document.getElementById('data-container').innerHTML = `
                <h3>Данные API</h3>
                <p><strong>Источник:</strong> ${data.source}</p>
                <p><strong>Время генерации:</strong> ${new Date(data.timestamp).toLocaleTimeString()}</p>
                <pre>${JSON.stringify(data.items, null, 2)}</pre>
            `;
        } catch (err) {
            showError('Ошибка загрузки данных');
        }
    }
});
