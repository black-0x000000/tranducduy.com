// ============ ĐĂNG NHẬP / ĐĂNG XUẤT ============

function updateUserInfo() {
    if (!window.currentUser) return;
    
    document.getElementById('userName').textContent = window.currentUser.username;
    const roleNames = { 
        owner: 'Chủ sở hữu hệ thống — toàn quyền', 
        admin: 'Quản trị viên', 
        user: 'Người dùng' 
    };
    document.getElementById('userRole').textContent = roleNames[window.currentUser.role] || 'Người dùng';
    document.getElementById('userAvatar').textContent = window.currentUser.username.charAt(0).toUpperCase();
}

async function login(username, password) {
    const account = findAccount(username, password);
    if (!account) {
        const loginError = document.getElementById('loginError');
        loginError.style.display = 'block';
        loginError.textContent = '❌ Sai tên đăng nhập hoặc mật khẩu';
        return false;
    }
    
    window.currentUser = { ...account };
    
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
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
    
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
    hideDeleteModal();
    showToast('👋 Đã đăng xuất!', 'success');
}

// ============ SỰ KIỆN ============
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginBtn').addEventListener('click', function() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        if (!username || !password) {
            document.getElementById('loginError').style.display = 'block';
            document.getElementById('loginError').textContent = '⚠️ Vui lòng nhập tên và mật khẩu';
            return;
        }
        login(username, password);
    });

    document.getElementById('loginUsername').addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') document.getElementById('loginBtn').click(); 
    });
    document.getElementById('loginPassword').addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') document.getElementById('loginBtn').click(); 
    });
    document.getElementById('logoutBtn').addEventListener('click', logout);
});
