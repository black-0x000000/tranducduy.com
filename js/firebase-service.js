// ============ FIREBASE CRUD ============
let accounts = [];
let unsubscribeListener = null;

// Lấy danh sách tài khoản
async function loadAccounts() {
    try {
        const snapshot = await db.collection('accounts').get();
        accounts = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            accounts.push({
                id: doc.id,
                username: data.username,
                password: data.password,
                role: data.role
            });
        });
        console.log('✅ Đã tải', accounts.length, 'tài khoản');
        return accounts;
    } catch (error) {
        console.error('❌ Lỗi tải:', error);
        return [];
    }
}

// Realtime listener
function startRealtimeListener() {
    if (unsubscribeListener) {
        unsubscribeListener();
    }
    
    unsubscribeListener = db.collection('accounts')
        .onSnapshot((snapshot) => {
            accounts = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                accounts.push({
                    id: doc.id,
                    username: data.username,
                    password: data.password,
                    role: data.role
                });
            });
            
            console.log('🔄 Cập nhật realtime:', accounts.length, 'tài khoản');
            
            if (window.currentUser && window.currentPage === 'management') {
                renderPage('management');
            }
            
            if (window.currentUser) {
                const updatedUser = accounts.find(acc => acc.id === window.currentUser.id);
                if (updatedUser) {
                    window.currentUser = { ...updatedUser };
                    updateUserInfo();
                }
            }
        }, (error) => {
            console.error('❌ Lỗi listener:', error);
        });
}

function stopRealtimeListener() {
    if (unsubscribeListener) {
        unsubscribeListener();
        unsubscribeListener = null;
    }
}

// Tạo tài khoản
async function createAccount(username, password, role) {
    try {
        const existing = accounts.find(acc => acc.username === username);
        if (existing) {
            return { success: false, message: '⚠️ Tên đăng nhập đã tồn tại!' };
        }
        
        await db.collection('accounts').add({
            username: username,
            password: password,
            role: role,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, message: `✅ Đã tạo tài khoản "${username}" thành công!` };
    } catch (error) {
        console.error('❌ Lỗi tạo:', error);
        return { success: false, message: '❌ Lỗi kết nối Firebase!' };
    }
}

// Xóa tài khoản
async function deleteAccount(id) {
    try {
        await db.collection('accounts').doc(id).delete();
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi xóa:', error);
        return { success: false };
    }
}

// Cập nhật tài khoản
async function updateAccount(id, newUsername) {
    try {
        await db.collection('accounts').doc(id).update({
            username: newUsername
        });
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi cập nhật:', error);
        return { success: false };
    }
}

// Đổi mật khẩu
async function changePassword(id, newPassword) {
    try {
        await db.collection('accounts').doc(id).update({
            password: newPassword
        });
        return { success: true };
    } catch (error) {
        console.error('❌ Lỗi đổi mật khẩu:', error);
        return { success: false };
    }
}

// Tìm tài khoản
function findAccount(username, password) {
    return accounts.find(acc => acc.username === username && acc.password === password);
}

// Lấy danh sách tài khoản quản lý
function getManagedAccounts(user) {
    if (user.role === 'owner') {
        return accounts.filter(acc => acc.id !== user.id);
    } else if (user.role === 'admin') {
        return accounts.filter(acc => acc.role === 'user');
    }
    return [];
}
