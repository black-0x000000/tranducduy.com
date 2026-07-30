// ============ MODAL XÁC NHẬN ============
let deleteTargetId = null;

const deleteModal = document.getElementById('deleteModal');
const deleteUsername = document.getElementById('deleteUsername');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

function showDeleteModal(username, id) {
    deleteUsername.textContent = `"${username}"`;
    deleteTargetId = id;
    deleteModal.classList.add('active');
    modalConfirm.disabled = false;
    modalConfirm.textContent = 'Xóa ngay';
}

function hideDeleteModal() {
    deleteModal.classList.remove('active');
    deleteTargetId = null;
}

modalCancel.addEventListener('click', hideDeleteModal);

deleteModal.addEventListener('click', function(e) {
    if (e.target === this) {
        hideDeleteModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && deleteModal.classList.contains('active')) {
        hideDeleteModal();
    }
});

// Xử lý xóa qua modal (sẽ được gọi từ bên ngoài)
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
