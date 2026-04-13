<script setup lang="ts">
const { alertState, closeAlert } = useAlert()
</script>

<template>
  <transition name="toast">
    <div v-if="alertState.show" :class="['modern-toast', alertState.type]" @click="closeAlert">
      <div class="toast-icon">
        <svg v-if="alertState.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <svg v-else-if="alertState.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      </div>
      <div class="toast-content">
        {{ alertState.message }}
      </div>
      <div class="toast-close">&times;</div>
    </div>
  </transition>
</template>

<style scoped>
.modern-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  min-width: 320px;
  max-width: 450px;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 9999;
  cursor: pointer;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.modern-toast.success { 
  border-left: 4px solid #10b981; 
  background: rgba(255, 255, 255, 0.98);
}
.modern-toast.error { 
  border-left: 4px solid #ef4444; 
  background: rgba(255, 255, 255, 0.98);
}
.modern-toast.info { 
  border-left: 4px solid #6366f1; 
  background: rgba(255, 255, 255, 0.98);
}

.toast-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.success .toast-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.error .toast-icon { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
.info .toast-icon { color: #6366f1; background: rgba(99, 102, 241, 0.1); }

.toast-content {
  flex: 1;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
}

.toast-close {
  color: rgba(0, 0, 0, 0.2);
  font-size: 1.25rem;
}

/* Animations */
.toast-enter-active { transition: all 0.4s cubic-bezier(0.17, 0.67, 0.83, 0.67); }
.toast-leave-active { transition: all 0.3s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(50px) scale(0.9); }
.toast-leave-to { opacity: 0; transform: translateY(-20px) scale(0.9); }
</style>
