// ============ RENDER FUNCTIONS ============

function renderMenu() {
    if (!window.currentUser) return;
    
    let menuHtml = '';
    const role = window.currentUser.role;
    
    // Trang chủ
    menuHtml += `<a class="active" data-page="home">Trang chủ</a>`;
    
    // Quản lý (chỉ Owner và Admin)
    if (role === 'owner' || role === 'admin') {
        menuHtml += `<a data-page="management">Quản lý</a>`;
    }
    
    // Chat (TẤT CẢ đều có)
    menuHtml += `<a data-page="chat">Chat</a>`;
    
    // Cài đặt
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
        case 'chat': renderChat(); break;
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

// ============ RENDER CHAT ============
let chatTopics = [];
let chatUnsubscribe = null;
let currentTopicId = null;

function renderChat() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;

    loadChatTopics();

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
            <h2 style="color:#fff; font-size:24px;">💬 Diễn đàn thảo luận</h2>
            <button class="create-btn" id="createTopicBtn">+ Tạo chủ đề mới</button>
        </div>
        <div id="topicList" style="display:flex; flex-direction:column; gap:12px;">
            <p style="color:#8892b0; text-align:center; padding:40px;">Đang tải chủ đề...</p>
        </div>
    `;
    content.innerHTML = html;

    const createBtn = document.getElementById('createTopicBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            const topicName = prompt('Nhập tên chủ đề mới:');
            if (topicName && topicName.trim() !== '') {
                createChatTopic(topicName.trim());
            }
        });
    }
}

async function loadChatTopics() {
    try {
        const snapshot = await db.collection('chat_topics').orderBy('createdAt', 'desc').get();
        chatTopics = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            chatTopics.push({
                id: doc.id,
                ...data
            });
        });
        renderTopicList();
    } catch (error) {
        console.error('Lỗi load chủ đề:', error);
        const topicList = document.getElementById('topicList');
        if (topicList) {
            topicList.innerHTML = `<p style="color:#ff6b6b; text-align:center; padding:40px;">❌ Lỗi tải chủ đề: ${error.message}</p>`;
        }
    }
}

function renderTopicList() {
    const topicList = document.getElementById('topicList');
    if (!topicList) return;

    if (chatTopics.length === 0) {
        topicList.innerHTML = `
            <div style="text-align:center; padding:40px; background:rgba(255,255,255,0.03); border-radius:16px; border:1px solid rgba(255,255,255,0.05);">
                <p style="color:#8892b0; font-size:18px;">📭 Chưa có chủ đề nào</p>
                <p style="color:#8892b0; font-size:14px; margin-top:8px;">Hãy tạo chủ đề đầu tiên để bắt đầu thảo luận!</p>
            </div>
        `;
        return;
    }

    topicList.innerHTML = chatTopics.map(topic => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; transition:all 0.3s;" 
             class="topic-item" 
             data-id="${topic.id}"
             onmouseover="this.style.borderColor='#64ffda'" 
             onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
            <div>
                <div style="color:#fff; font-weight:600; font-size:16px;">${topic.name}</div>
                <div style="color:#8892b0; font-size:13px; margin-top:4px;">
                    👤 ${topic.createdBy || 'Unknown'} • ${topic.messageCount || 0} tin nhắn
                </div>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="action-btn edit" onclick="openChatTopic('${topic.id}')">💬 Tham gia</button>
                ${window.currentUser && (window.currentUser.role === 'owner' || window.currentUser.username === topic.createdBy) ? 
                    `<button class="action-btn delete" onclick="deleteChatTopic('${topic.id}')">🗑️</button>` : ''}
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.topic-item').forEach(item => {
        item.addEventListener('click', function() {
            const id = this.dataset.id;
            openChatTopic(id);
        });
    });
}

async function createChatTopic(name) {
    try {
        await db.collection('chat_topics').add({
            name: name,
            createdBy: window.currentUser ? window.currentUser.username : 'Unknown',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            messageCount: 0
        });
        showToast('✅ Đã tạo chủ đề!', 'success');
        loadChatTopics();
    } catch (error) {
        console.error('Lỗi tạo chủ đề:', error);
        showToast('❌ Lỗi tạo chủ đề!', 'error');
    }
}

async function deleteChatTopic(id) {
    if (!confirm('Bạn có chắc muốn xóa chủ đề này?')) return;
    try {
        const messages = await db.collection('chat_messages').where('topicId', '==', id).get();
        messages.forEach(doc => {
            db.collection('chat_messages').doc(doc.id).delete();
        });
        await db.collection('chat_topics').doc(id).delete();
        showToast('✅ Đã xóa chủ đề!', 'success');
        loadChatTopics();
    } catch (error) {
        console.error('Lỗi xóa chủ đề:', error);
        showToast('❌ Lỗi xóa chủ đề!', 'error');
    }
}

function openChatTopic(topicId) {
    currentTopicId = topicId;
    const topic = chatTopics.find(t => t.id === topicId);
    if (!topic) return;

    const modal = document.getElementById('chatModal');
    const title = document.getElementById('chatTopicTitle');
    const messagesDiv = document.getElementById('chatMessages');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    const errorDiv = document.getElementById('chatError');

    if (!modal) return;
    
    title.textContent = `💬 ${topic.name}`;
    modal.classList.add('active');
    messagesDiv.innerHTML = '<p style="color:#8892b0; text-align:center;">Đang tải tin nhắn...</p>';

    loadChatMessages(topicId);

    const sendMessage = async function() {
        const text = input.value.trim();
        if (!text) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = '⚠️ Vui lòng nhập tin nhắn!';
            return;
        }
        errorDiv.style.display = 'none';

        try {
            await db.collection('chat_messages').add({
                topicId: topicId,
                username: window.currentUser ? window.currentUser.username : 'Guest',
                message: text,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await db.collection('chat_topics').doc(topicId).update({
                messageCount: firebase.firestore.FieldValue.increment(1)
            });
            input.value = '';
            loadChatMessages(topicId);
        } catch (error) {
            console.error('Lỗi gửi tin nhắn:', error);
            errorDiv.style.display = 'block';
            errorDiv.textContent = '❌ Lỗi gửi tin nhắn!';
        }
    };

    sendBtn.onclick = sendMessage;
    input.onkeydown = function(e) {
        if (e.key === 'Enter') sendMessage();
        errorDiv.style.display = 'none';
    };

    document.getElementById('closeChatModal').onclick = function() {
        if (chatUnsubscribe) {
            chatUnsubscribe();
            chatUnsubscribe = null;
        }
        modal.classList.remove('active');
    };
}

function loadChatMessages(topicId) {
    if (chatUnsubscribe) {
        chatUnsubscribe();
        chatUnsubscribe = null;
    }

    chatUnsubscribe = db.collection('chat_messages')
        .where('topicId', '==', topicId)
        .orderBy('createdAt', 'asc')
        .onSnapshot((snapshot) => {
            const messagesDiv = document.getElementById('chatMessages');
            if (!messagesDiv) return;

            if (snapshot.empty) {
                messagesDiv.innerHTML = `
                    <div style="text-align:center; padding:30px;">
                        <p style="color:#8892b0;">💬 Chưa có tin nhắn nào</p>
                        <p style="color:#8892b0; font-size:13px;">Hãy là người đầu tiên gửi tin nhắn!</p>
                    </div>
                `;
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const isOwn = data.username === (window.currentUser ? window.currentUser.username : '');
                html += `
                    <div style="display:flex; ${isOwn ? 'justify-content:flex-end' : 'justify-content:flex-start'}; margin-bottom:12px;">
                        <div style="max-width:70%; background:${isOwn ? 'rgba(100,255,218,0.1)' : 'rgba(255,255,255,0.05)'}; border:1px solid ${isOwn ? 'rgba(100,255,218,0.2)' : 'rgba(255,255,255,0.05)'}; border-radius:12px; padding:12px 16px;">
                            <div style="font-size:12px; color:#64ffda; font-weight:600; margin-bottom:4px;">
                                ${data.username || 'Unknown'} 
                                <span style="color:#8892b0; font-weight:400; font-size:11px;">
                                    ${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleTimeString() : ''}
                                </span>
                            </div>
                            <div style="color:#e0e0e0; word-wrap:break-word;">${data.message}</div>
                        </div>
                    </div>
                `;
            });
            messagesDiv.innerHTML = html;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, (error) => {
            console.error('Lỗi load tin nhắn:', error);
        });
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
