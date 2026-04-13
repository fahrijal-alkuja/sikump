<script setup lang="ts">
// Redirect to kepegawaian as it is the main module migrated
await navigateTo('/kepegawaian')
</script>

<template>
  <div class="landing-page">
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Redirecting to Dashboard...</p>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: white;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
