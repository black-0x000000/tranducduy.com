// ============ KHỞI TẠO ============

async function init() {
    try {
        // Kiểm tra Firebase
        if (typeof firebase === 'undefined') {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML = `
                    <p style="color:#ff6b6b;">❌ Lỗi: Firebase chưa được load!</p>
                    <p style="color:#8892b0;font-size:14px;margin-top:10px;">Kiểm tra lại file firebase-config.js</p>
                `;
            }
            return;
        }
        
        await loadAccounts();
        
        const loading = document.getElementById('loading');
        const loginContainer = document.getElementById('login-container');
        
        if (loading) loading.style.display = 'none';
        if (loginContainer) loginContainer.style.display = 'block';
        
        console.log('🚀 Hệ thống sẵn sàng!');
        console.log('📊 Số tài khoản:', accounts.length);
        
        if (accounts.length === 0) {
            console.warn('⚠️ Chưa có tài khoản nào! Tạo tài khoản Owner trong Firebase Console.');
        }
    } catch (error) {
        console.error('❌ Lỗi khởi tạo:', error);
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <p style="color:#ff6b6b;">❌ Lỗi kết nối Firebase!</p>
                <p style="color:#8892b0;font-size:14px;margin-top:10px;">${error.message}</p>
            `;
        }
    }
}

// Chạy khi trang load xong
document.addEventListener('DOMContentLoaded', init);
