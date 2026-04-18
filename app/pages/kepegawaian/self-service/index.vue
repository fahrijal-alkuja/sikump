<script setup lang="ts">
import { ref, computed } from 'vue'

const user = useUser()
const { data: profileData, refresh } = await useFetch<any>('/api/kepegawaian/self-service/profile')

const employee = computed(() => profileData.value?.success ? profileData.value.data : null)
const activeTab = ref('overview')

// Update logic placeholder
const isSaving = ref(false)
const pswd = ref({ new: '', confirm: '' })

const handleSave = async () => {
  isSaving.value = true
  // Simulate save personal data
  await new Promise(r => setTimeout(r, 1000))
  isSaving.value = false
  alert('Data profil berhasil diperbarui (Simulasi)')
}

const handleUpdatePassword = async () => {
  if (pswd.value.new !== pswd.value.confirm) {
    alert('Konfirmasi password tidak cocok!')
    return
  }
  if (pswd.value.new.length < 6) {
    alert('Password minimal 6 karakter!')
    return
  }

  isSaving.value = true
  try {
    const res = await $fetch<any>('/api/kepegawaian/self-service/change-password', {
      method: 'POST',
      body: { newPassword: pswd.value.new }
    })
    if (res.success) {
      alert(res.message)
      pswd.value = { new: '', confirm: '' }
    } else {
      alert(res.message)
    }
  } catch (err: any) {
    alert('Gagal memperbarui password')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="self-service-page">
    <div v-if="employee" class="container">
      <header class="dashboard-header">
        <div class="h-text">
          <h1>Pusat Layanan Mandiri Tendik</h1>
          <p>Kelola data personal, karir, dan cetak portofolio profesional Anda.</p>
        </div>
        <div class="h-actions">
           <NuxtLink to="/kepegawaian/survei/tendik" class="btn-survey">
             📝 Isi Survei Kepuasan
           </NuxtLink>
        </div>
      </header>

      <div class="dashboard-layout">
        <!-- Sidebar Navigation -->
        <aside class="dashboard-sidebar glass-card">
          <div class="user-brief">
            <div class="u-avatar">{{ employee.nama[0] }}</div>
            <div class="u-info">
              <h3>{{ employee.nama }}</h3>
              <span>NIK: {{ employee.nik }}</span>
            </div>
          </div>
          <nav class="side-nav">
            <button :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
              <span>👤</span> Profil Saya
            </button>
            <button :class="{ active: activeTab === 'career' }" @click="activeTab = 'career'">
              <span>📈</span> Riwayat Karir
            </button>
            <button :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'">
              <span>🔒</span> Keamanan Akun
            </button>
            <button :class="{ active: activeTab === 'portfolio' }" @click="activeTab = 'portfolio'">
              <span>📄</span> Cetak Portofolio
            </button>
          </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="dashboard-main">
          <div v-if="activeTab === 'overview'" class="tab-content animated-entrance">
            <section class="glass-card section-card">
              <div class="section-header">
                <h3>Data Personal</h3>
                <button @click="handleSave" class="btn-save" :disabled="isSaving">
                  {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
              </div>
              <div class="form-grid">
                <div class="input-group">
                  <label>Nama Lengkap</label>
                  <input v-model="employee.nama" type="text" />
                </div>
                <div class="input-group">
                  <label>Tempat Lahir</label>
                  <input v-model="employee.tempat_lahir" type="text" />
                </div>
                <div class="input-group">
                  <label>Tanggal Lahir</label>
                  <input :value="employee.tanggal_lahir?.split('T')[0]" type="date" />
                </div>
                <div class="input-group">
                  <label>Telepon</label>
                  <input v-model="employee.telepon" type="text" />
                </div>
                <div class="input-group full-width">
                  <label>Alamat Domisili</label>
                  <textarea v-model="employee.alamat" rows="3"></textarea>
                </div>
              </div>
            </section>
          </div>

          <div v-if="activeTab === 'career'" class="tab-content animated-entrance">
             <section class="glass-card section-card">
                <h3>Riwayat Pekerjaan</h3>
                <div class="career-timeline">
                   <div v-for="job in employee.riwayat_jabatan" :key="job.id" class="timeline-item">
                      <div class="t-marker"></div>
                      <div class="t-content">
                         <span class="t-date">{{ job.tmt || 'N/A' }}</span>
                         <h4>{{ job.nama_jabatan || 'Jabatan' }}</h4>
                         <p>{{ job.nama_biro || 'Unit Kerja' }}</p>
                         <span class="t-sk">SK: {{ job.no_sk || '-' }}</span>
                      </div>
                   </div>
                </div>
             </section>
          </div>

          <div v-if="activeTab === 'security'" class="tab-content animated-entrance">
             <section class="glass-card section-card p-center">
                <div class="security-intro">
                   <div class="s-badge">🔒 KEAMANAN</div>
                   <h3>Perbarui Kata Sandi</h3>
                   <p>Demi keamanan, mohon ubah password bawaan (NIK) Anda dengan kata sandi yang lebih kuat.</p>
                </div>
                <div class="pswd-form">
                   <div class="input-group">
                      <label>Password Baru</label>
                      <input v-model="pswd.new" type="password" placeholder="Minimal 6 karakter..." />
                   </div>
                   <div class="input-group">
                      <label>Konfirmasi Password Baru</label>
                      <input v-model="pswd.confirm" type="password" placeholder="Ulangi password baru..." />
                   </div>
                   <button @click="handleUpdatePassword" class="btn-save pswd-btn" :disabled="isSaving">
                      {{ isSaving ? 'Memproses...' : 'Update Password Akun' }}
                   </button>
                </div>
             </section>
          </div>

          <div v-if="activeTab === 'portfolio'" class="tab-content animated-entrance">
             <KepegawaianResumeProfessional :employee="employee" />
          </div>
        </main>
      </div>
    </div>
    
    <div v-else-if="profileData && !profileData.success" class="error-state">
       <h2>Akses Ditolak</h2>
       <p>{{ profileData.message }}</p>
    </div>
  </div>
</template>

<style scoped>
.self-service-page { min-height: 100vh; background: #f8fafc; padding: 3rem 0; }
.container { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }

.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
.h-text h1 { font-size: 2.2rem; font-weight: 950; color: #1e293b; margin-bottom: 0.5rem; }
.h-text p { color: #64748b; font-size: 1.1rem; }

.btn-survey { background: #eef2ff; color: #4f46e5; padding: 0.75rem 1.5rem; border-radius: 12px; text-decoration: none; font-weight: 700; transition: 0.3s; }
.btn-survey:hover { background: #4f46e5; color: white; transform: translateY(-2px); }

.dashboard-layout { display: grid; grid-template-columns: 300px 1fr; gap: 2.5rem; }

.dashboard-sidebar { padding: 2rem; height: fit-content; position: sticky; top: 2rem; }
.user-brief { text-align: center; margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 1px solid #e2e8f0; }
.u-avatar { width: 80px; height: 80px; background: #4f46e5; color: white; border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 900; margin: 0 auto 1.5rem; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2); }
.u-info h3 { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
.u-info span { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }

.side-nav { display: flex; flex-direction: column; gap: 0.5rem; }
.side-nav button { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; border: none; background: none; color: #64748b; font-weight: 700; font-size: 0.95rem; border-radius: 12px; cursor: pointer; transition: 0.2s; text-align: left; }
.side-nav button:hover { background: #f1f5f9; color: #1e293b; }
.side-nav button.active { background: #4f46e5; color: white; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }

.section-card { padding: 2.5rem; background: white; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.section-header h3 { font-size: 1.25rem; font-weight: 800; color: #1e293b; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label { font-size: 0.85rem; font-weight: 700; color: #64748b; }
input, textarea { padding: 0.75rem 1rem; border-radius: 12px; border: 1.5px solid #e2e8f0; font-size: 0.95rem; }
.full-width { grid-column: span 2; }

.btn-save { background: #1e293b; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; }
.btn-save:hover:not(:disabled) { background: #4f46e5; transform: scale(1.05); }

.career-timeline { padding-left: 20px; border-left: 2px solid #e2e8f0; display: flex; flex-direction: column; gap: 2.5rem; }
.timeline-item { position: relative; }
.t-marker { position: absolute; left: -26px; top: 8px; width: 10px; height: 10px; background: #4f46e5; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
.t-date { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
.t-content h4 { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 4px 0; }
.t-content p { color: #64748b; font-weight: 600; margin-bottom: 4px; }
.t-sk { font-size: 0.8rem; color: #4f46e5; font-weight: 700; }

/* Security Tab Styles */
.p-center { max-width: 600px; margin: 0 auto; text-align: center; }
.security-intro { margin-bottom: 2.5rem; }
.s-badge { display: inline-block; background: #fef2f2; color: #ef4444; padding: 4px 12px; border-radius: 99px; font-size: 0.7rem; font-weight: 800; margin-bottom: 1rem; }
.security-intro h3 { font-size: 1.5rem; font-weight: 900; color: #1e293b; margin-bottom: 0.5rem; }
.security-intro p { color: #64748b; font-size: 0.95rem; line-height: 1.6; }
.pswd-form { display: flex; flex-direction: column; gap: 1.5rem; text-align: left; }
.pswd-btn { width: 100%; padding: 1rem; margin-top: 1rem; background: #4f46e5; }

.animated-entrance { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 1024px) {
  .dashboard-layout { grid-template-columns: 1fr; }
  .dashboard-sidebar { position: static; }
}
</style>
