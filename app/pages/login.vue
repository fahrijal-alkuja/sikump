<script setup lang="ts">
definePageMeta({
  layout: false
})

const username = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const router = useRouter()
const user = useUser()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    const response = await $fetch<any>('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    
    if (response.success) {
      user.value = response.user
      success.value = 'Akses Diterima. Membuka Dashboard...'
      
      setTimeout(() => {
        navigateTo('/kepegawaian')
      }, 800)
    } else {
      error.value = response.message || 'Otentikasi Gagal. Mohon periksa kembali data Anda.'
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Gagal terhubung ke server.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <!-- Animated Background -->
    <div class="bg-visual">
      <img src="/Users/fahrijal/.gemini/antigravity/brain/20aed6d6-5bc4-4228-93ef-80f9c5150ee2/login_premium_bg_1776184898778.png" alt="Visual" class="bg-img" />
      <div class="overlay-gradient"></div>
    </div>
    
    <main class="login-main">
      <div class="glass-card login-card">
        <header class="card-header">
          <div class="brand-visual">
            <div class="brand-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="brand-info">
              <h1>SIKUMP<span>.unikarta</span></h1>
              <p>Human Resource Command Center</p>
            </div>
          </div>
        </header>

        <section class="form-section">
          <div class="section-title">
            <h2>Selamat Datang</h2>
            <p>Sistem Informasi Kepegawaian & Manajemen Personalia</p>
          </div>

          <form @submit.prevent="handleLogin" class="elegant-form">
            <Transition name="fade">
              <div v-if="error" class="alert error-alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {{ error }}
              </div>
            </Transition>
            
            <Transition name="fade">
              <div v-if="success" class="alert success-alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {{ success }}
              </div>
            </Transition>
            
            <div class="input-field">
              <label>Identitas Pengguna</label>
              <div class="input-container">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input v-model="username" type="text" placeholder="Username atau Email" required />
              </div>
            </div>

            <div class="input-field">
              <label>Kata Sandi</label>
              <div class="input-container">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input v-model="password" type="password" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" :disabled="loading" class="btn-submit">
              <span v-if="!loading">Masuk ke Dashboard</span>
              <div v-else class="loading-spinner"></div>
            </button>
          </form>
        </section>

        <footer class="card-footer">
          <p>© 2026 UNIKARTA • Smart Campus Initiative</p>
        </footer>
      </div>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

:root {
  --primary-accent: #6366f1;
  --primary-glow: rgba(99, 102, 241, 0.5);
  --glass-bg: rgba(15, 23, 42, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
}

.login-wrapper {
  min-height: 100vh;
  background: #020617;
  font-family: 'Outfit', sans-serif;
  color: white;
  display: flex;
  overflow: hidden;
  position: relative;
}

.bg-visual {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
  filter: brightness(0.8);
}

.overlay-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, #020617 100%);
}

.login-main {
  flex: 1;
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 480px;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 32px;
  padding: 3rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cardEntrance {
  from { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(10px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

.card-header {
  margin-bottom: 2.5rem;
}

.brand-visual {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-logo {
  width: 48px;
  height: 48px;
  background: var(--primary-accent);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px var(--primary-glow);
}

.brand-info h1 {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0;
}

.brand-info h1 span {
  color: var(--primary-accent);
}

.brand-info p {
  color: #94a3b8;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 2px;
}

.section-title h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.section-title p {
  color: #94a3b8;
  font-size: 0.9375rem;
  margin-bottom: 2.5rem;
}

.elegant-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.alert {
  padding: 1rem 1.25rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.success-alert {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #a7f3d0;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.input-field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  padding-left: 0.5rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1.25rem;
  width: 20px;
  height: 20px;
  color: #64748b;
  pointer-events: none;
  transition: color 0.3s;
}

.input-container input {
  width: 100%;
  padding: 1.125rem 1.25rem 1.125rem 3.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.input-container input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--primary-accent);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.input-container input:focus + .input-icon {
  color: var(--primary-accent);
}

.btn-submit {
  margin-top: 1rem;
  padding: 1.125rem;
  background: var(--primary-accent);
  border: none;
  border-radius: 18px;
  color: white;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 10px 25px -5px var(--primary-glow);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-submit:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -10px var(--primary-glow);
}

.btn-submit:active {
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  filter: grayscale(0.5);
  cursor: not-allowed;
  transform: none;
}

.card-footer {
  margin-top: 3rem;
  text-align: center;
  color: #475569;
  font-size: 0.8125rem;
  font-weight: 500;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active { transition: all 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
