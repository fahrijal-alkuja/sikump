<script setup lang="ts">
const user = useUser()
const showModal = ref(false)
const route = useRoute()

const checkSurvey = async () => {
  if (user.value?.role !== 'tendik') return
  if (route.path === '/kepegawaian/survei/tendik') return

  try {
    const data: any = await $fetch('/api/kepegawaian/survei/check')
    if (data.success && !data.filled) {
      showModal.value = true
    }
  } catch (e) {
    console.error('Failed to check survey status')
  }
}

onMounted(() => {
  checkSurvey()
})

// Re-check on route change
watch(() => route.path, () => {
  if (!showModal.value) checkSurvey()
})
</script>

<template>
  <div v-if="showModal" class="mandatory-overlay">
    <div class="mandatory-box glass-card animate-bounce-in">
      <div class="icon-pulse">📝</div>
      <h2 class="title">Survei Kepuasan Wajib</h2>
      <p class="desc">
        Halo <strong>{{ user?.first_name }}</strong>, sesuai dengan syarat akreditasi institusi, setiap Tenaga Kependidikan wajib mengisi Survei Kepuasan setiap semester.
      </p>
      <p class="sub-desc">Mohon luangkan waktu 2-3 menit untuk memberikan penilaian Anda.</p>
      
      <div class="action-zone">
        <NuxtLink to="/kepegawaian/survei/tendik" class="btn-primary-survey" @click="showModal = false">
          Isi Survei Sekarang
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mandatory-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.mandatory-box {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 40px;
  padding: 50px 40px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.icon-pulse {
  font-size: 60px;
  margin-bottom: 25px;
  display: inline-block;
  animation: pulse 2s infinite;
}

.title {
  font-size: 28px;
  font-weight: 950;
  color: #1e293b;
  margin-bottom: 15px;
  letter-spacing: -1px;
}

.desc {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 10px;
}

.sub-desc {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 35px;
}

.btn-primary-survey {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  padding: 18px 30px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 16px;
  transition: all 0.3s;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
}

.btn-primary-survey:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(79, 70, 229, 0.4);
  background: #4338ca;
}

.btn-primary-survey svg {
  width: 20px;
  height: 20px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.animate-bounce-in {
  animation: bounceIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes bounceIn {
  from { opacity: 0; transform: scale(0.8) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
