<script setup lang="ts">
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/kepegawaian' })
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">{{ error?.statusCode || 500 }}</div>
      <h1 class="error-title">Terjadi Kesalahan</h1>
      <p class="error-message">
        {{ error?.message || 'Maaf, sistem mengalami kendala teknis. Tim IT sedang menanganinya.' }}
      </p>
      
      <div class="error-actions">
        <button @click="handleError" class="btn-home">
          Kembali ke Dashboard
        </button>
      </div>
    </div>

    <!-- Decorative background elements -->
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>
  </div>
</template>

<style scoped>
.error-page {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #050a18;
  color: white;
  overflow: hidden;
  position: relative;
}

.error-content {
  text-align: center;
  z-index: 10;
  max-width: 500px;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2rem;
}

.error-code {
  font-family: 'Outfit', sans-serif;
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.error-title {
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.error-message {
  color: #94a3b8;
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.btn-home {
  background: var(--primary);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-home:hover {
  background: var(--primary-hover);
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(99, 102, 241, 0.5);
}

.btn-home:active {
  transform: translateY(-1px);
}

.bg-blob {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  filter: blur(100px);
  border-radius: 50%;
  z-index: 1;
}

.blob-1 {
  top: -10%;
  right: -5%;
}

.blob-2 {
  bottom: -15%;
  left: -10%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
}
</style>
