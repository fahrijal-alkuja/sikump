<script setup lang="ts">
const { confirmState, closeConfirm } = useAlert()

const handleConfirm = () => {
  if (confirmState.value.onConfirm) confirmState.value.onConfirm()
  closeConfirm()
}
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="confirmState.show" class="confirm-overlay" @click.self="closeConfirm">
        <div class="confirm-card glass-card">
          <div class="confirm-icon">⚠️</div>
          <h3>{{ confirmState.title || 'Konfirmasi Hapus' }}</h3>
          <p>{{ confirmState.message || 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' }}</p>
          
          <div class="confirm-actions">
            <button @click="closeConfirm" class="btn-cancel">Batal</button>
            <button @click="handleConfirm" class="btn-confirm">Ya, Hapus</button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.confirm-card {
  width: 90%;
  max-width: 400px;
  padding: 2.5rem;
  text-align: center;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: #1e293b;
}

p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
}

.confirm-actions button {
  flex: 1;
  padding: 0.8rem;
  border-radius: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-confirm {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.btn-confirm:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
