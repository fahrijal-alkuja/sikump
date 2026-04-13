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
  background-color: #0f172a;
  color: white;
  overflow: hidden;
  position: relative;
  font-family: 'Inter', sans-serif;
}

.error-content {
  text-align: center;
  z-index: 10;
  max-width: 500px;
  padding: 2rem;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, #1e293b 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.error-message {
  color: #94a3b8;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn-home {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-home:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
}

.bg-blob {
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(99, 102, 241, 0.1);
  filter: blur(80px);
  border-radius: 50%;
  z-index: 1;
}

.blob-1 {
  top: -100px;
  right: -100px;
}

.blob-2 {
  bottom: -100px;
  left: -100px;
  background: rgba(16, 185, 129, 0.05);
}
</style>
