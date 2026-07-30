// ============ ĐĂNG NHẬP / ĐĂNG XUẤT ============

function updateUserInfo() {
    if (!window.currentUser) return;
    
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = window.currentUser.username;
    
    const roleNames = { 
        owner: 'Chủ sở hữu hệ thống — toàn quyền', 
        admin: 'Quản trị viên', 
        user: 'Người dùng' 
    };
    if (userRole) userRole.textContent = roleNames[window.currentUser.role] || 'Người dùng';
    if (userAvatar) userAvatar.textContent = window.currentUser.username.charAt(0).toUpperCase();
}

async function login(username, password) {
    const account = findAccount(username, password);
    if (!account) {
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.style.display = 'block';
            loginError.textContent = '❌ Sai tên đăng nhập hoặc mật khẩu';
        }
        return false;
    }
    
    window.currentUser = { ...account };
    
    const loginError = document.getElementById('loginError');
    if (loginError) loginError.style.display = 'none';
    
    const loginContainer = document.getElementById('login-container');
    const dashboard = document.getElementById('dashboard');
    
    if (loginContainer) loginContainer.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    
    startRealtimeListener();
    updateUserInfo();
    renderMenu();
    renderPage('home');
    showToast(`👋 Chào mừng ${window.currentUser.username}!`, 'success');
    return true;
}

function logout() {
    stopRealtimeListener();
    window.currentUser = null;
    window.currentPage = 'home';
    
    const dashboard = document.getElementById('dashboard');
    const loginContainer = document.getElementById('login-container');
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');
    
    if (dashboard) dashboard.style.display = 'none';
    if (loginContainer) loginContainer.style.display = 'block';
    if (loginUsername) loginUsername.value = '';
    if (loginPassword) loginPassword.value = '';
    if (loginError) loginError.style.display = 'none';
    
    hideDeleteModal();
    showToast('👋 Đã đăng xuất!', 'success');
}

// ============ SỰ KIỆN ============
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const username = loginUsername ? loginUsername.value.trim() : '';
            const password = loginPassword ? loginPassword.value.trim() : '';
            if (!username || !password) {
                const loginError = document.getElementById('loginError');
                if (loginError) {
                    loginError.style.display = 'block';
                    loginError.textContent = '⚠️ Vui lòng nhập tên và mật khẩu';
                }
                return;
            }
            login(username, password);
        });
    }

    if (loginUsername) {
        loginUsername.addEventListener('keydown', (e) => { 
            if (e.key === 'Enter' && loginBtn) loginBtn.click(); 
        });
    }
    if (loginPassword) {
        loginPassword.addEventListener('keydown', (e) => { 
            if (e.key === 'Enter' && loginBtn) loginBtn.click(); 
        });
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
