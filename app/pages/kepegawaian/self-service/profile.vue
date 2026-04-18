<script setup lang="ts">
import { ref, computed } from 'vue'

const user = useUser()
const { data: response, refresh } = await useFetch<any>('/api/kepegawaian/self-service/profile')
const profile = computed(() => response.value?.data || {})

const activeSection = ref('profil')

const sections = [
  { id: 'profil', label: 'Profil Saya', icon: '👤' },
  { id: 'pendidikan', label: 'Riwayat Pendidikan', icon: '🎓' },
  { id: 'pelatihan', label: 'Riwayat Pelatihan', icon: '📜' },
  { id: 'keluarga', label: 'Data Keluarga', icon: '👨‍👩‍👧‍👦' },
  { id: 'keamanan', label: 'Keamanan Akun', icon: '🔒' },
  { id: 'portofolio', label: 'Cetak Portofolio', icon: '📄' }
]

// Password Form
const passwordForm = ref({ old_password: '', new_password: '', confirm_password: '' })
const notification = ref({ show: false, title: '', message: '', status: 'success' })

async function updatePassword() {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    notification.value = { show: true, title: 'Error', message: 'Konfirmasi password tidak cocok', status: 'error' }
    return
  }
  try {
    const res = await $fetch<any>('/api/kepegawaian/self-service/change-password', {
      method: 'POST',
      body: passwordForm.value
    })
    if (res.success) {
      notification.value = { show: true, title: 'Berhasil', message: 'Password telah diperbarui', status: 'success' }
      passwordForm.value = { old_password: '', new_password: '', confirm_password: '' }
    }
  } catch (e: any) {
    notification.value = { show: true, title: 'Gagal', message: e.data?.message || 'Gagal mengubah password', status: 'error' }
  }
}

const showSurveyCheck = () => {
    // Logic to open survey if needed
}
</script>

<template>
  <div class="self-service-layout">
    <UiModernAlert />
    
    <div class="page-header">
      <div class="header-content">
        <h1>Pusat Layanan Mandiri Tendik</h1>
        <p>Kelola data personal, karir, dan cetak portofolio profesional Anda.</p>
      </div>
      <div class="header-actions">
        <NuxtLink to="/kepegawaian" class="btn-back">
          Kembali ke Dashboard Admin
        </NuxtLink>
        <NuxtLink to="/kepegawaian/survei/tendik" class="btn-survey">
          ✨ Isi Survei Kepuasan
        </NuxtLink>
      </div>
    </div>

    <!-- Survey Warning Alert -->
    <div v-if="!profile.survey_filled" class="survey-warning-box animated-fade">
      <div class="warning-icon">⌛</div>
      <div class="warning-content">
        <h3>Survei Kepuasan Tahun {{ new Date().getFullYear() }} Belum Diisi</h3>
        <p>Mohon luangkan waktu sejenak untuk mengisi instrumen kepuasan layanan institusi sebagai syarat administrasi dan peningkatan mutu penjaminan internal.</p>
        <NuxtLink to="/kepegawaian/survei/tendik" class="btn-warning-action">Isi Sekarang →</NuxtLink>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Sidebar Menu -->
      <aside class="side-menu glass-card">
        <div class="user-brief">
          <div class="avatar-lg">{{ profile.nama?.charAt(0) }}</div>
          <div class="brief-info">
            <h3>{{ profile.nama }}</h3>
            <span class="nik">NIK: {{ profile.nik }}</span>
          </div>
        </div>

        <nav class="nav-list">
          <button 
            v-for="s in sections" 
            :key="s.id"
            @click="activeSection = s.id"
            :class="['nav-item', { active: activeSection === s.id }]"
          >
            <span class="nav-icon">{{ s.icon }}</span>
            {{ s.label }}
          </button>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="content-area glass-card">
        <!-- Profil Section -->
        <div v-if="activeSection === 'profil'" class="section-box animated-fade">
          <div class="section-header">
            <h2>Data Personal</h2>
          </div>
          <KepegawaianProfileSection :employee="profile" @refresh="refresh" />
        </div>

        <!-- Pendidikan Section -->
        <div v-if="activeSection === 'pendidikan'" class="section-box animated-fade">
          <div class="section-header">
            <h2>Riwayat Pendidikan</h2>
          </div>
          <KepegawaianEducationSection :nik="profile.nik" :educationData="profile.riwayat_pendidikan" @refresh="refresh" />
        </div>

        <!-- Pelatihan Section -->
        <div v-if="activeSection === 'pelatihan'" class="section-box animated-fade">
          <div class="section-header">
            <h2>Riwayat Pelatihan & Diklat</h2>
          </div>
          <KepegawaianTrainingSection 
            :nik="profile.nik" 
            :trainingData="profile.riwayat_pelatihan" 
            @refresh="refresh" 
          />
        </div>

        <!-- Keluarga Section -->
        <div v-if="activeSection === 'keluarga'" class="section-box animated-fade">
          <div class="section-header">
            <h2>Data Keluarga</h2>
          </div>
          <KepegawaianFamilySection :nik="profile.nik" :familyData="profile.riwayat_keluarga" @refresh="refresh" />
        </div>

        <!-- Keamanan Section -->
        <div v-if="activeSection === 'keamanan'" class="section-box animated-fade max-w-2xl">
          <div class="section-header">
            <h2>Keamanan Akun</h2>
          </div>
          <div class="security-form">
            <div class="input-set">
              <label>Password Lama</label>
              <input v-model="passwordForm.old_password" type="password" class="standard-input" placeholder="••••••••" />
            </div>
            <div class="input-set">
              <label>Password Baru</label>
              <input v-model="passwordForm.new_password" type="password" class="standard-input" placeholder="••••••••" />
            </div>
            <div class="input-set">
              <label>Konfirmasi Password Baru</label>
              <input v-model="passwordForm.confirm_password" type="password" class="standard-input" placeholder="••••••••" />
            </div>
            <button @click="updatePassword" class="btn-primary-action w-full mt-4">Perbarui Password</button>
          </div>
        </div>

        <!-- Portofolio Section -->
        <div v-if="activeSection === 'portofolio'" class="section-box animated-fade">
          <div class="section-header">
            <h2>Professional Portfolio</h2>
          </div>
          <KepegawaianResumeProfessional :employee="profile" />
        </div>
      </main>
    </div>

    <!-- Notifications -->
    <Transition name="slide-fade">
      <div v-if="notification.show" class="global-notification" :class="notification.status">
        <div class="n-icon">
          <svg v-if="notification.status === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="n-text">
          <div class="n-title">{{ notification.title }}</div>
          <div class="n-desc">{{ notification.message }}</div>
        </div>
        <button @click="notification.show = false" class="n-close">×</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.self-service-layout { padding: 40px; min-height: 100vh; background: #f8fafc; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; }
.header-content h1 { font-size: 42px; font-weight: 950; color: #1e293b; letter-spacing: -2px; margin: 0; }
.header-content p { color: #64748b; font-size: 18px; font-weight: 600; margin-top: 10px; }

.header-actions { display: flex; gap: 15px; align-items: center; }
.btn-survey { background: #eef2ff; color: #4f46e5; padding: 14px 24px; border-radius: 18px; font-weight: 800; text-decoration: none; transition: 0.3s; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.1); font-size: 14px; }
.btn-survey:hover { background: #4f46e5; color: white; transform: translateY(-3px); }

.btn-back { background: #f8fafc; color: #64748b; padding: 14px 24px; border-radius: 18px; font-weight: 800; text-decoration: none; transition: 0.3s; border: 2px solid #f1f5f9; font-size: 14px; }
.btn-back:hover { background: #1e293b; color: white; border-color: #1e293b; }

.survey-warning-box {
  background: white;
  border: 1px solid #fed7aa;
  padding: 30px;
  border-radius: 28px;
  margin-bottom: 40px;
  display: flex;
  gap: 25px;
  align-items: center;
  box-shadow: 0 15px 30px rgba(245, 158, 11, 0.08);
  border-left: 10px solid #f59e0b;
}

.warning-icon { font-size: 44px; }
.warning-content h3 { font-size: 22px; font-weight: 950; color: #1e293b; margin: 0 0 8px; letter-spacing: -0.5px; }
.warning-content p { font-size: 16px; color: #64748b; margin: 0 15px 0 0; line-height: 1.6; font-weight: 600; }

.btn-warning-action {
  display: inline-block;
  background: #f59e0b;
  color: white;
  padding: 12px 24px;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 800;
  font-size: 14px;
  transition: 0.3s;
  white-space: nowrap;
  margin-top: 15px;
}

.btn-warning-action:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2);
}

.dashboard-grid { display: grid; grid-template-columns: 320px 1fr; gap: 30px; align-items: flex-start; }

.side-menu { background: white; border-radius: 32px; padding: 30px; border: 1px solid #f1f5f9; position: sticky; top: 40px; }
.user-brief { text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px dashed #e2e8f0; }
.avatar-lg { width: 90px; height: 90px; background: #4f46e5; color: white; border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 900; margin: 0 auto 20px; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2); }
.brief-info h3 { font-size: 20px; font-weight: 900; color: #1e293b; margin: 0; letter-spacing: -0.5px; }
.nik { font-size: 13px; font-weight: 700; color: #94a3b8; display: block; margin-top: 5px; }

.nav-list { display: flex; flex-direction: column; gap: 8px; }
.nav-item { display: flex; align-items: center; gap: 15px; padding: 16px 20px; border: none; background: transparent; color: #64748b; font-weight: 800; font-size: 15px; border-radius: 18px; cursor: pointer; transition: 0.3s; text-align: left; }
.nav-item:hover { background: #f8fafc; color: #1e293b; }
.nav-item.active { background: #4f46e5; color: white; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2); }
.nav-icon { font-size: 20px; }

.content-area { background: white; border-radius: 32px; padding: 50px; border: 1px solid #f1f5f9; min-height: 600px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.section-header h2 { font-size: 28px; font-weight: 950; color: #1e293b; margin: 0; letter-spacing: -1px; }

.btn-save-mini { background: #1e293b; color: white; padding: 10px 20px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; }
.btn-save-mini:hover { background: #000; }

.career-stack { display: flex; flex-direction: column; gap: 50px; }
.divider { height: 1px; background: #f1f5f9; width: 100%; }

.input-set { display: flex; flex-direction: column; margin-bottom: 20px; }
.input-set label { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; }
.standard-input { padding: 16px 20px; background: #f8fafc; border: 2px solid #f1f5f9; border-radius: 18px; font-size: 16px; font-weight: 700; outline: none; transition: 0.3s; }
.standard-input:focus { border-color: #4f46e5; background: white; }

.btn-primary-action { background: #4f46e5; color: white; padding: 18px; border-radius: 18px; border: none; font-weight: 900; cursor: pointer; transition: 0.3s; }
.btn-primary-action:hover { background: #4338ca; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(79,70,229,0.2); }

.max-w-2xl { max-width: 600px; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animated-fade { animation: fadeIn 0.4s ease-out; }

/* Notification Styles */
.global-notification { position: fixed; top: 2rem; right: 2rem; z-index: 3000; min-width: 320px; padding: 16px 20px; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 16px; border-left: 6px solid #4f46e5; }
.global-notification.error { border-left-color: #ef4444; }
.n-icon { width: 24px; height: 24px; color: #4f46e5; }
.error .n-icon { color: #ef4444; }
.n-text { flex: 1; }
.n-title { font-weight: 900; font-size: 14px; }
.n-desc { font-size: 12px; color: #64748b; }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateX(20px); opacity: 0; }
</style>
