// ============ RENDER FUNCTIONS ============

function renderMenu() {
    if (!window.currentUser) return;
    
    let menuHtml = '';
    const role = window.currentUser.role;
    menuHtml += `<a class="active" data-page="home">Trang chủ</a>`;
    if (role === 'owner' || role === 'admin') {
        menuHtml += `<a data-page="management">Quản lý</a>`;
    }
    menuHtml += `<a data-page="settings">Cài đặt</a>`;
    
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    navMenu.innerHTML = menuHtml;
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            window.currentPage = this.dataset.page;
            renderPage(window.currentPage);
        });
    });
}

function renderPage(page) {
    if (!window.currentUser) return;
    
    const role = window.currentUser.role;
    
    if (role === 'user' && page === 'management') {
        page = 'home';
        document.querySelectorAll('.nav-menu a').forEach(l => {
            l.classList.remove('active');
            if (l.dataset.page === 'home') l.classList.add('active');
        });
    }
    
    switch(page) {
        case 'home': renderHome(); break;
        case 'management': renderManagement(); break;
        case 'settings': renderSettings(); break;
        default: renderHome();
    }
}

function renderHome() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;
    content.innerHTML = `
        <div class="update-placeholder">
            <span class="icon">🚧</span>
            <h2>Website đang được cập nhật</h2>
            <p>Chúng tôi đang nâng cấp hệ thống để phục vụ bạn tốt hơn</p>
        </div>
    `;
}

function renderManagement() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;
    
    const managedAccounts = getManagedAccounts(window.currentUser);
    const roleLabels = { user: 'User', admin: 'Admin', owner: 'Owner' };

    let html = `
        <div class="management-header">
            <h2>Tài khoản người dùng bạn quản lý</h2>
            <button class="create-btn" id="openCreateModal">+ Tạo tài khoản</button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>TÊN ĐĂNG NHẬP</th>
                        <th>LOẠI</th>
                        <th>THAO TÁC</th>
                    </tr>
                </thead>
                <tbody>
                    ${managedAccounts.length === 0 ? `
                        <tr>
                            <td colspan="3" style="text-align:center; color:#8892b0; padding:30px;">
                                Chưa có tài khoản nào
                            </td>
                        </tr>
                    ` : managedAccounts.map(acc => `
                        <tr>
                            <td>${acc.username}</td>
                            <td><span class="role-badge ${acc.role}">${roleLabels[acc.role] || acc.role}</span></td>
                            <td>
                                <div class="action-btns">
                                    <button class="action-btn edit" data-id="${acc.id}">Sửa</button>
                                    <button class="action-btn delete" data-id="${acc.id}" data-username="${acc.username}">Xóa</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div id="createFormContainer">
            <div class="settings-card">
                <h3>➕ Tạo tài khoản mới</h3>
                <div class="form-group">
                    <label>Tên đăng nhập</label>
                    <input type="text" id="newUsername" placeholder="Nhập tên đăng nhập" />
                </div>
                <div class="form-group">
                    <label>Mật khẩu</label>
                    <input type="password" id="newPassword" placeholder="Nhập mật khẩu" />
                </div>
                <div class="form-group">
                    <label>Loại tài khoản</label>
                    <select id="newRole">
                        <option value="user">User</option>
                        ${window.currentUser.role === 'owner' ? '<option value="admin">Admin</option>' : ''}
                    </select>
                </div>
                <button class="settings-btn" id="createAccountBtn">Tạo tài khoản</button>
                <button class="settings-btn" style="margin-top:10px; background:rgba(255,255,255,0.1);" id="closeCreateForm">Hủy</button>
                <div id="createMsg" class="mt-2"></div>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
    
    // Xử lý form tạo tài khoản
    const openModal = document.getElementById('openCreateModal');
    const closeForm = document.getElementById('closeCreateForm');
    const formContainer = document.getElementById('createFormContainer');
    const createBtn = document.getElementById('createAccountBtn');
    const newUsername = document.getElementById('newUsername');
    const newPassword = document.getElementById('newPassword');
    const newRole = document.getElementById('newRole');
    const createMsg = document.getElementById('createMsg');

    if (formContainer) formContainer.style.display = 'none';

    if (openModal) {
        openModal.addEventListener('click', () => {
            if (formContainer) formContainer.style.display = 'block';
            openModal.style.display = 'none';
        });
    }
    if (closeForm) {
        closeForm.addEventListener('click', () => {
            if (formContainer) formContainer.style.display = 'none';
            if (openModal) openModal.style.display = 'inline-block';
        });
    }

    if (createBtn) {
        createBtn.addEventListener('click', async function() {
            const username = newUsername ? newUsername.value.trim() : '';
            const password = newPassword ? newPassword.value.trim() : '';
            const role = newRole ? newRole.value : 'user';

            if (!username || !password) {
                if (createMsg) {
                    createMsg.className = 'msg-error';
                    createMsg.textContent = '⚠️ Vui lòng nhập đầy đủ thông tin';
                }
                return;
            }

            const result = await createAccount(username, password, role);
            if (createMsg) {
                createMsg.className = result.success ? 'msg-success' : 'msg-error';
                createMsg.textContent = result.message;
            }
            
            if (result.success) {
                if (newUsername) newUsername.value = '';
                if (newPassword) newPassword.value = '';
                showToast(result.message, 'success');
                setTimeout(() => {
                    if (formContainer) formContainer.style.display = 'none';
                    if (openModal) openModal.style.display = 'inline-block';
                }, 1500);
            }
        });
    }

    // Xóa
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const username = this.dataset.username;
            const account = accounts.find(acc => acc.id === id);
            
            if (account && account.role === 'owner') {
                showToast('❌ Không thể xóa tài khoản Owner!', 'error');
                return;
            }
            
            showDeleteModal(username, id);
        });
    });

    // Sửa
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.dataset.id;
            const account = accounts.find(acc => acc.id === id);
            if (!account) return;
            if (account.role === 'owner') {
                showToast('❌ Không thể sửa tài khoản Owner!', 'error');
                return;
            }
            
            const newUsername = prompt('Nhập tên đăng nhập mới:', account.username);
            if (newUsername && newUsername.trim() !== '') {
                if (accounts.some(acc => acc.username === newUsername.trim() && acc.id !== id)) {
                    showToast('⚠️ Tên đăng nhập đã tồn tại!', 'error');
                    return;
                }
                const result = await updateAccount(id, newUsername.trim());
                if (result.success) {
                    showToast('✅ Đã cập nhật tài khoản!', 'success');
                } else {
                    showToast('❌ Lỗi khi cập nhật!', 'error');
                }
            }
        });
    });
}

function renderSettings() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="settings-container">
            <div class="settings-card">
                <h3>🔒 Đổi mật khẩu</h3>
                <div class="form-group">
                    <label>Mật khẩu cũ</label>
                    <input type="password" id="oldPassword" placeholder="Nhập mật khẩu cũ" />
                </div>
                <div class="form-group">
                    <label>Mật khẩu mới</label>
                    <input type="password" id="newPassword" placeholder="Nhập mật khẩu mới" />
                </div>
                <div class="form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <input type="password" id="confirmPassword" placeholder="Xác nhận mật khẩu mới" />
                </div>
                <button class="settings-btn" id="changePasswordBtn">Đổi Mật Khẩu</button>
                <div id="passwordMsg" class="mt-2"></div>
            </div>

            <div class="settings-card">
                <h3>👤 Tài Khoản</h3>
                <p style="color: #8892b0; margin-bottom: 16px;">Đăng xuất khỏi thiết bị này.</p>
                <button class="settings-btn danger-btn" id="logoutDeviceBtn">Đăng Xuất Hệ Thống</button>
            </div>
        </div>
    `;

    const changeBtn = document.getElementById('changePasswordBtn');
    if (changeBtn) {
        changeBtn.addEventListener('click', async function() {
            const oldPass = document.getElementById('oldPassword') ? document.getElementById('oldPassword').value : '';
            const newPass = document.getElementById('newPassword') ? document.getElementById('newPassword').value : '';
            const confirmPass = document.getElementById('confirmPassword') ? document.getElementById('confirmPassword').value : '';
            const msg = document.getElementById('passwordMsg');

            if (!oldPass || !newPass || !confirmPass) {
                if (msg) {
                    msg.className = 'msg-error';
                    msg.textContent = '⚠️ Vui lòng nhập đầy đủ thông tin';
                }
                return;
            }
            if (oldPass !== window.currentUser.password) {
                if (msg) {
                    msg.className = 'msg-error';
                    msg.textContent = '❌ Mật khẩu cũ không đúng';
                }
                return;
            }
            if (newPass !== confirmPass) {
                if (msg) {
                    msg.className = 'msg-error';
                    msg.textContent = '❌ Mật khẩu xác nhận không khớp';
                }
                return;
            }
            if (newPass.length < 6) {
                if (msg) {
                    msg.className = 'msg-error';
                    msg.textContent = '❌ Mật khẩu mới phải có ít nhất 6 ký tự';
                }
                return;
            }

            const result = await changePassword(window.currentUser.id, newPass);
            if (result.success) {
                window.currentUser.password = newPass;
                if (msg) {
                    msg.className = 'msg-success';
                    msg.textContent = '✅ Đổi mật khẩu thành công!';
                }
                const oldInput = document.getElementById('oldPassword');
                const newInput = document.getElementById('newPassword');
                const confirmInput = document.getElementById('confirmPassword');
                if (oldInput) oldInput.value = '';
                if (newInput) newInput.value = '';
                if (confirmInput) confirmInput.value = '';
                showToast('✅ Đổi mật khẩu thành công!', 'success');
            } else {
                if (msg) {
                    msg.className = 'msg-error';
                    msg.textContent = '❌ Lỗi khi đổi mật khẩu!';
                }
            }
        });
    }

    const logoutBtn = document.getElementById('logoutDeviceBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}
