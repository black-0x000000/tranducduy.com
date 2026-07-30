// ============ KHỞI TẠO ============

async function init() {
    await loadAccounts();
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
    
    console.log('🚀 Hệ thống sẵn sàng!');
    console.log('📊 Số tài khoản:', accounts.length);
}

// Khởi tạo
init();
