// ============ KHỞI TẠO ============

async function init() {
    try {
        // Kiểm tra Firebase
        if (typeof firebase === 'undefined') {
            console.error('❌ Lỗi: Firebase chưa được load!');
            return;
        }
        
        await loadAccounts();
        
        // Đảm bảo login container hiển thị
        const loginContainer = document.getElementById('login-container');
        if (loginContainer) {
            loginContainer.style.display = 'block';
        }
        
        console.log('🚀 Hệ thống sẵn sàng!');
        console.log('📊 Số tài khoản:', accounts.length);
        
        if (accounts.length === 0) {
            console.warn('⚠️ Chưa có tài khoản nào! Tạo tài khoản Owner trong Firebase Console.');
        }
    } catch (error) {
        console.error('❌ Lỗi khởi tạo:', error);
        // Vẫn hiện login dù có lỗi
        const loginContainer = document.getElementById('login-container');
        if (loginContainer) {
            loginContainer.style.display = 'block';
        }
    }
}

// Chạy khi trang load xong
document.addEventListener('DOMContentLoaded', init);
