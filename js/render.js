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
    
    document.getElementById('navMenu').innerHTML = menuHtml;
    
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
    document.getElementById('dashboardContent').innerHTML = `
        <div class="update-placeholder">
            <span class="icon">🚧</span>
            <h2>Website đang được cập nhật</h2>
            <p>Chúng tôi đang nâng cấp hệ thống để phục vụ bạn tốt hơn</p>
        </div>
    `;
}

function renderManagement() {
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
    
    document.getElementById('dashboardContent').innerHTML = html;
    
    // Xử lý form tạo tài khoản
    const openModal = document.getElementById('openCreateModal');
    const closeForm = document.getElementById('closeCreateForm');
    const formContainer = document.getElementById('createFormContainer');
    const createBtn = document.getElementById('createAccountBtn');
    const newUsername = document.getElementById('newUsername');
    const newPassword = document.getElementById('newPassword');
    const newRole = document.getElementById('newRole');
    const createMsg = document.getElementById('createMsg');

    formContainer.style.display = 'none';

    if (openModal) {
        openModal.addEventListener('click', () => {
            formContainer.style.display = 'block';
            openModal.style.display = 'none';
        });
    }
    if (closeForm) {
        closeForm.addEventListener('click', () => {
            formContainer.style.display = 'none';
            if (openModal) openModal.style.display = 'inline-block';
        });
    }

    if (createBtn) {
        createBtn.addEventListener('click', async function() {
            const username = newUsername.value.trim();
            const password = newPassword.value.trim();
            const role = newRole.value;

            if (!username || !password) {
                createMsg.className = 'msg-error';
                createMsg.textContent = '⚠️ Vui lòng nhập đầy đủ thông tin';
                return;
            }

            const result = await createAccount(username, password, role);
            createMsg.className = result.success ? 'msg-success' : 'msg-error';
            createMsg.textContent = result.message;
            
            if (result.success) {
                newUsername.value = '';
                newPassword.value = '';
                showToast(result.message, 'success');
                setTimeout(() => {
                    formContainer.style.display = 'none';
                    if (openModal) openModal.style.display = 'inline-block';
                }, 1500);
            }
        });
    }

    // Xóa - mở modal
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
    let html = `
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
    
    document.getElementById('dashboardContent').innerHTML = html;

    document.getElementById('changePasswordBtn').addEventListener('click', async function() {
        const oldPass = document.getElementById('oldPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        const msg = document.getElementById('passwordMsg');

        if (!oldPass || !newPass || !confirmPass) {
            msg.className = 'msg-error';
            msg.textContent = '⚠️ Vui lòng nhập đầy đủ thông tin';
            return;
        }
        if (oldPass !== window.currentUser.password) {
            msg.className = 'msg-error';
            msg.textContent = '❌ Mật khẩu cũ không đúng';
            return;
        }
        if (newPass !== confirmPass) {
            msg.className = 'msg-error';
            msg.textContent = '❌ Mật khẩu xác nhận không khớp';
            return;
        }
        if (newPass.length < 6) {
            msg.className = 'msg-error';
            msg.textContent = '❌ Mật khẩu mới phải có ít nhất 6 ký tự';
            return;
        }

        const result = await changePassword(window.currentUser.id, newPass);
        if (result.success) {
            window.currentUser.password = newPass;
            msg.className = 'msg-success';
            msg.textContent = '✅ Đổi mật khẩu thành công!';
            document.getElementById('oldPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            showToast('✅ Đổi mật khẩu thành công!', 'success');
        } else {
            msg.className = 'msg-error';
            msg.textContent = '❌ Lỗi khi đổi mật khẩu!';
        }
    });

    document.getElementById('logoutDeviceBtn').addEventListener('click', logout);
}
