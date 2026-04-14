<script setup lang="ts">
import { ref } from 'vue'
const { showAlert, askConfirm } = useAlert()
// @ts-ignore
const route = useRoute()
const router = useRouter()
const nik = route.params.nik as string

// @ts-ignore
const { data: employeeData, pending, refresh } = await useFetch<any>(`/api/kepegawaian/${nik}`)

const activeTab = ref('profil')
const showEditModal = ref(false)

const handleEditSuccess = () => {
  showEditModal.value = false
  refresh()
}

const tabs = [
  { id: 'profil', label: 'Profil' },
  { id: 'resume', label: 'Resume Professional' },
  { id: 'jabatan', label: 'Jabatan Struktural' },
  { id: 'jafung', label: 'Jabatan Akademik' },
  { id: 'pangkat', label: 'Kepangkatan' },
  { id: 'pendidikan', label: 'Pendidikan' },
  { id: 'intelligence', label: 'Career Intelligence ✨' },
  { id: 'sertifikasi', label: 'Sertifikasi' },
  { id: 'pelatihan', label: 'Pelatihan' },
  { id: 'pengangkatan', label: 'Kepegawaian' },
  { id: 'keluarga', label: 'Keluarga' },
  { id: 'pajak_askes', label: 'Pajak & Askes' }
]

const handleDeleteEmployee = async () => {
    askConfirm(
        'Hapus Pegawai', 
        'Apakah Anda yakin ingin menghapus data pegawai ini beserta seluruh riwayatnya? Tindakan ini bersifat permanen.',
        async () => {
            try {
                const res = await $fetch<any>(`/api/kepegawaian/${nik}/profile`, { method: 'DELETE' })
                if (res.success) {
                    showAlert('Data pegawai berhasil dihapus', 'success')
                    const target = (employeeData.value.data.type === 'dosen' || employeeData.value.data.ikatan_kerja === '1') ? '/kepegawaian/dosen' : '/kepegawaian/tendik'
                    router.push(target)
                } else {
                    showAlert(res.message, 'error')
                }
            } catch (e) { showAlert('Gagal menghapus data', 'error') }
        }
    )
}
const getJafungName = (code: string | number) => {
  const map: any = { 1: 'Asisten Ahli', 2: 'Lektor', 3: 'Lektor Kepala', 4: 'Guru Besar' }
  return map[code] || '-'
}
</script>

<template>
  <div class="profile-detail-page scrollbar-hide">
    <UiModernAlert />
    <UiModernConfirm />
    
    <div class="container mx-auto px-4 py-8">
      <div v-if="pending" class="loading-state">
        <p>Memuat data karyawan...</p>
      </div>

      <div v-else-if="employeeData?.success" class="content-wrapper">
        <div class="profile-header glass-card">
          <div class="header-container">
            <div class="header-main">
              <div class="avatar-circle">
                {{ employeeData.data.nama?.charAt(0) }}
              </div>
              <div class="header-info">
                <NuxtLink :to="(employeeData.data.type === 'dosen' || employeeData.data.ikatan_kerja === '1') ? '/kepegawaian/dosen' : '/kepegawaian/tendik'" class="btn-back">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                   Kembali ke Daftar
                </NuxtLink>
                <h2>{{ employeeData.data.nama }}</h2>
                <div class="identity-badges">
                  <!-- NUPTK only for Dosen -->
                  <template v-if="employeeData.data.ikatan_kerja === '1'">
                    <div class="badge-item">
                      <span class="lbl">NUPTK</span>
                      <span class="val">{{ employeeData.data.nuptk || '-' }}</span>
                    </div>
                    <div class="badge-divider"></div>
                  </template>
                  
                  <div class="badge-item">
                    <span class="lbl">NIK</span>
                    <span class="val">{{ employeeData.data.nik }}</span>
                  </div>
                  <div class="badge-divider"></div>
                  <div class="badge-item">
                    <span class="lbl">{{ employeeData.data.ikatan_kerja === '1' ? 'HOMEBASE' : 'UNIT KERJA / BIRO' }}</span>
                    <span class="val">{{ employeeData.data.unit || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <button @click="handleDeleteEmployee" class="btn-danger-minimal">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                Hapus Pegawai
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="tabs-nav">
          <button 
            v-for="tab in (employeeData.data.type === 'dosen' || employeeData.data.ikatan_kerja == '1' ? tabs : tabs.filter(t => t.id !== 'sertifikasi' && t.id !== 'jafung'))" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-item', { active: activeTab === tab.id }]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Contents -->
        <div class="tab-content-wrapper">
          <!-- Profil Section -->
        <div v-if="activeTab === 'profil'" class="profil-sections-container">
          <!-- Sister Integrity Check for Dosen -->
          <UiSisterIntegrity v-if="employeeData.data.nidn" :employee="employeeData.data" class="mx-auto max-w-5xl mb-12" />
          
          <!-- Promotion Readiness for Dosen -->
          <UiPromotionReadiness v-if="employeeData.data.nidn" :employee="employeeData.data" class="mx-auto max-w-5xl mb-12" />

          <!-- Study Expiry Alert -->
          <div v-if="employeeData.data.status_aktif === '2' && employeeData.data.tgl_selesai_studi" class="study-alert mx-auto max-w-5xl mb-12">
             <div class="alert-content">
                <span class="icon">🎓</span> 
                <div>
                   <h4>Peringatan Masa Tugas Belajar</h4>
                   <p>Masa tugas belajar dosen ini berakhir pada <strong>{{ new Date(employeeData.data.tgl_selesai_studi).toLocaleDateString() }}</strong>. Mohon segera cek progres kelulusannya.</p>
                </div>
             </div>
          </div>

          <KepegawaianProfileSection :employee="employeeData.data" @refresh="refresh" />
        </div>

          <!-- Resume Section -->
          <div v-if="activeTab === 'resume'">
            <KepegawaianResumeProfessional :employee="employeeData.data" />
          </div>

          <!-- Jabatan Section -->
          <div v-if="activeTab === 'jabatan'">
            <KepegawaianJabatanSection 
              :nik="nik" 
              :type="employeeData.data.ikatan_kerja === '1' ? 'dosen' : 'tendik'"
              :jafung-data="employeeData.data.riwayat_jafung || []"
              :jabatan-data="employeeData.data.riwayat_jabatan || []"
              @refresh="refresh"
            />
          </div>

          <!-- Jafung Section -->
          <div v-if="activeTab === 'jafung'">
            <KepegawaianJafungSection 
              :nik="nik" 
              :jafung-data="employeeData.data.riwayat_jafung || []"
              @refresh="refresh"
            />
          </div>

          <!-- Pangkat Section -->
          <div v-if="activeTab === 'pangkat'">
            <KepegawaianPangkatSection 
              :nik="nik" 
              :pangkat-data="employeeData.data.riwayat_pangkat || []" 
              @refresh="refresh" 
            />
          </div>

          <!-- Pendidikan Section -->
          <div v-if="activeTab === 'pendidikan'">
            <KepegawaianEducationSection :nik="nik" :educationData="employeeData.data.riwayat_pendidikan" @refresh="refresh" />
          </div>

          <!-- Intelligence Section -->
          <div v-if="activeTab === 'intelligence'">
            <KepegawaianIntelligenceSection :employee="employeeData.data" />
          </div>

          <!-- Sertifikasi Section -->
          <div v-if="activeTab === 'sertifikasi'">
            <KepegawaianCertificationSection :nik="nik" @refresh="refresh" />
          </div>

          <!-- Pelatihan Section -->
          <div v-if="activeTab === 'pelatihan'">
            <KepegawaianTrainingSection :nik="nik" :trainingData="employeeData.data.riwayat_pelatihan" @refresh="refresh" />
          </div>

          <!-- Pengangkatan Section -->
          <div v-if="activeTab === 'pengangkatan'">
            <KepegawaianAppointmentSection :nik="nik" :appointmentData="employeeData.data.riwayat_pengangkatan" @refresh="refresh" />
          </div>

          <!-- Keluarga Section -->
          <div v-if="activeTab === 'keluarga'">
            <KepegawaianFamilySection :nik="nik" :familyData="employeeData.data.riwayat_keluarga" @refresh="refresh" />
          </div>

          <!-- Pajak & Askes Section -->
          <div v-if="activeTab === 'pajak_askes'">
            <KepegawaianInsuranceSection :nik="nik" :taxData="employeeData.data.tmst_pajak" :askesData="employeeData.data.tmst_askes" @refresh="refresh" />
          </div>
        </div>
      </div>

      <div v-else class="error-state">
        <p>Data karyawan tidak ditemukan.</p>
        <NuxtLink to="/kepegawaian/dosen">Kembali ke Daftar</NuxtLink>
      </div>
    </div>

    <!-- Edit Modal -->
    <KepegawaianEmployeeModal 
      v-if="employeeData?.success"
      :show="showEditModal" 
      :type="employeeData.data.type === 'dosen' ? '1' : '2'" 
      :employee="employeeData.data"
      @close="showEditModal = false" 
      @success="handleEditSuccess"
    />
  </div>
</template>

<style scoped>
.btn-back {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
}

.profile-header {
  padding: 2.5rem 3rem;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.btn-danger-minimal {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-danger-minimal:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.btn-outline-minimal {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}
.btn-outline-minimal:hover { background: rgba(99, 102, 241, 0.1); border-color: var(--primary); }

.avatar-circle {
  width: 80px;
  height: 80px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.header-info { display: flex; flex-direction: column; gap: 0.25rem; }
.header-info h2 { font-size: 2.25rem; font-weight: 900; color: #1e293b; margin: 0; letter-spacing: -1px; }

.btn-back { display: flex; align-items: center; gap: 0.5rem; color: #64748b; text-decoration: none; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.25rem; transition: 0.2s; }
.btn-back:hover { color: var(--primary); }

.identity-badges { display: flex; align-items: center; gap: 1.25rem; margin-top: 0.5rem; }
.badge-item { display: flex; flex-direction: column; }
.badge-item .lbl { font-size: 0.65rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
.badge-item .val { font-size: 0.95rem; color: var(--primary); font-family: monospace; font-weight: 700; }
.badge-divider { width: 1px; height: 20px; background: #e2e8f0; }

.tabs-nav {
  display: flex;
  gap: 0.25rem;
  margin: 1.5rem 0 2rem;
  background: rgba(241, 245, 249, 0.8);
  padding: 0.4rem;
  border-radius: 16px;
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  white-space: nowrap;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.5);
}

.tabs-nav::-webkit-scrollbar {
  display: none; /* Hide scrollbar for Chrome, Safari and Opera */
}

.tab-item {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 0.75rem 1.4rem;
  cursor: pointer;
  flex-shrink: 0;
  font-weight: 700;
  font-size: 0.8rem;
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-content-wrapper {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03);
  border: 1px solid var(--glass-border);
}

.tab-item.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-item label {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.info-item span {
  font-size: 1.1rem;
  font-weight: 500;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
}

.premium-table th {
  text-align: left;
  padding: 1rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--glass-border);
}

.premium-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-badge.active { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.status-badge.inactive { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.btn-danger-outline {
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-danger-outline:hover {
  background: #ef4444;
  color: white;
}

.empty-tab {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
}
.detail-sub-section h4 { font-size: 0.9rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; }
.mb-2 { margin-bottom: 2rem; }
.action-badge { background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }

.study-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 1.5rem;
  border-radius: 1rem;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { border-color: rgba(239, 68, 68, 0.3); }
  50% { border-color: rgba(239, 68, 68, 0.8); }
  100% { border-color: rgba(239, 68, 68, 0.3); }
}

.alert-content { display: flex; gap: 1rem; align-items: flex-start; }
.alert-content .icon { font-size: 2rem; }
.alert-content h4 { margin: 0; color: #ef4444; font-weight: 800; }
.alert-content p { margin: 0.25rem 0 0; font-size: 0.9rem; color: var(--text-muted); }
.mx-auto { margin-left: auto; margin-right: auto; }
.max-w-5xl { max-width: 1100px; }
.mb-12 { margin-bottom: 3rem; }
</style>
