// ============ MODAL XÁC NHẬN ============
let deleteTargetId = null;

const deleteModal = document.getElementById('deleteModal');
const deleteUsername = document.getElementById('deleteUsername');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

function showDeleteModal(username, id) {
    if (!deleteUsername || !deleteModal) return;
    
    deleteUsername.textContent = `"${username}"`;
    deleteTargetId = id;
    deleteModal.classList.add('active');
    modalConfirm.disabled = false;
    modalConfirm.textContent = 'Xóa ngay';
}

function hideDeleteModal() {
    if (!deleteModal) return;
    deleteModal.classList.remove('active');
    deleteTargetId = null;
}

if (modalCancel) {
    modalCancel.addEventListener('click', hideDeleteModal);
}

if (deleteModal) {
    deleteModal.addEventListener('click', function(e) {
        if (e.target === this) {
            hideDeleteModal();
        }
    });
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && deleteModal && deleteModal.classList.contains('active')) {
        hideDeleteModal();
    }
});

// Xử lý xóa (gọi từ bên ngoài)
if (modalConfirm) {
    modalConfirm.addEventListener('click', async function() {
        if (!deleteTargetId) return;
        
        modalConfirm.disabled = true;
        modalConfirm.textContent = '⏳ Đang xóa...';
        
        const result = await deleteAccount(deleteTargetId);
        
        if (result.success) {
            showToast('✅ Đã xóa tài khoản thành công!', 'success');
            hideDeleteModal();
        } else {
            showToast('❌ Lỗi khi xóa tài khoản!', 'error');
            modalConfirm.disabled = false;
            modalConfirm.textContent = 'Xóa ngay';
        }
    });
}
