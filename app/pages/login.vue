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
      // Update state aplikasi secara instan agar middleware tidak menghadang
      user.value = response.user
      success.value = 'Login berhasil! Membuka Dashboard...'
      
      setTimeout(() => {
        navigateTo('/kepegawaian')
      }, 500)
    } else {
      error.value = response.message || 'Login gagal. Cek kembali username & password.'
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Terjadi kesalahan sistem.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-visual">
       <div class="glow-sphere"></div>
       <div class="glow-sphere-2"></div>
    </div>
    
    <div class="login-container">
      <div class="glass-card login-card">
        <div class="logo-section">
          <div class="logo-box">U</div>
          <h1>SIKUMP<span>.next</span></h1>
          <p>Sistem Informasi Kepegawaian & Manajemen Personalia</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div v-if="error" class="error-alert">{{ error }}</div>
          <div v-if="success" class="success-alert">{{ success }}</div>
          
          <div class="input-group">
            <label>Username / Email</label>
            <input 
              v-model="username" 
              type="text" 
              placeholder="Masukkan username" 
              required
              class="glass-input"
            />
          </div>

          <div class="input-group">
            <label>Password</label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              required
              class="glass-input"
            />
          </div>

          <button type="submit" :disabled="loading" class="btn-login">
            <span v-if="!loading">Masuk Ke Sistem</span>
            <span v-else class="loader"></span>
          </button>
        </form>

        <div class="login-footer">
          <p>© 2026 UNIKARTA - Universitas Kutai Kartanegara</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  background: #050a18;
  color: white;
  overflow: hidden;
  position: relative;
}

.login-visual {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.glow-sphere {
  position: absolute;
  top: -10%;
  right: -5%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  filter: blur(80px);
}

.glow-sphere-2 {
  position: absolute;
  bottom: -15%;
  left: -10%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%);
  filter: blur(100px);
}

.login-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 3rem;
  border-radius: 2rem;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.logo-section {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-box {
  width: 50px;
  height: 50px;
  background: var(--primary);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.logo-section h1 {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0;
}

.logo-section h1 span {
  color: var(--primary);
}

.logo-section p {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  padding-left: 0.25rem;
}

.glass-input {
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
}

.glass-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.btn-login {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--primary);
  border: none;
  border-radius: 1rem;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-alert {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.15);
  border-left: 4px solid #ef4444;
  color: #fca5a5;
  font-size: 0.875rem;
  border-radius: 0.5rem;
}

.success-alert {
  padding: 1rem;
  background: rgba(16, 185, 129, 0.15);
  border-left: 4px solid #10b981;
  color: #a7f3d0;
  font-size: 0.875rem;
  border-radius: 0.5rem;
}

.login-footer {
  margin-top: 3rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
