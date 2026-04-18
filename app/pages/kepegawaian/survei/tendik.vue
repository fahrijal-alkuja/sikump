<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'

const user = useUser()

// Fetch profile data to auto-fill identity
const { data: profileResponse } = await useFetch<any>('/api/kepegawaian/self-service/profile')
const profile = computed(() => profileResponse.value?.data || {})

// Masa Kerja Calculation
const calculateMasaKerja = (tmtStr?: string) => {
  if (!tmtStr) return ''
  
  let start: Date
  // Handle DD-MM-YYYY format
  if (tmtStr.includes('-')) {
    const parts = tmtStr.split('-')
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      if (parts[2].length === 4) { // YYYY is at the end
        start = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      } else { // YYYY is at the start
        start = new Date(tmtStr)
      }
    } else {
      start = new Date(tmtStr)
    }
  } else {
    start = new Date(tmtStr)
  }

  if (isNaN(start.getTime())) return ''
  
  const now = new Date()
  const diffYears = now.getFullYear() - start.getFullYear()
  
  if (diffYears < 1) return '< 1 tahun'
  if (diffYears <= 2) return '1-2 tahun'
  if (diffYears <= 4) return '3-4 tahun'
  if (diffYears <= 10) return '5-10 tahun'
  return '> 10 tahun'
}

onMounted(() => {
  if (user.value?.role === 'admin') {
    navigateTo('/kepegawaian/survei/analisis')
  }

    // Auto-fill identity from profile
    if (profile.value && profile.value.nik) {
      const p = profile.value
      form.identitas.nama = p.nama || form.identitas.nama
      form.identitas.unit_kerja = p.unit || ''
      form.identitas.jabatan = p.riwayat_jabatan?.[0]?.nama_jabatan || ''
      
      // Handle mapping status
      const ik = String(p.ikatan_kerja || '').trim()
      if (ik === '1' || ik.toLowerCase() === 'tetap') {
        form.identitas.status_kepegawaian = 'Pegawai Tetap'
      } else if (ik === '2' || ik.toLowerCase() === 'kontrak') {
        form.identitas.status_kepegawaian = 'Pegawai Kontrak'
      } else {
        form.identitas.status_kepegawaian = ik || 'Internal'
      }
      
      // Masa Kerja dari TMT Pengangkatan SK Pertama
      const firstSK = p.riwayat_pengangkatan?.[0]?.tmt
      form.identitas.masa_kerja = calculateMasaKerja(firstSK)
    }
})

const isSubmitted = ref(false)
const isSubmitting = ref(false)

const years = computed(() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => (current - i).toString())
})

const form = reactive({
  identitas: {
    nama: user.value?.first_name || '',
    nik: user.value?.username || '',
    unit_kerja: '',
    jabatan: '',
    status_kepegawaian: '',
    masa_kerja: '',
    tahun: new Date().getFullYear().toString()
  },
  penilaian: {
    A1: 0, A2: 0, A3: 0, A4: 0,
    B1: 0, B2: 0, B3: 0,
    C1: 0, C2: 0,
    D1: 0, D2: 0, D3: 0, D4: 0,
    E1: 0, E2: 0, E3: 0, E4: 0
  } as Record<string, number>,
  pimpinan_atasan: '',
  terbuka: {
    aspek_memuaskan: '',
    aspek_ditingkatkan: '',
    saran_perbaikan: ''
  },
  deklarasi: false
})

const sections = [
  {
    title: 'I. Dukungan Terhadap Pendidikan & Pengajaran',
    items: [
      { id: 'A1', text: 'Tugas dan fungsi Tendik jelas dan mendukung proses akademik.' },
      { id: 'A2', text: 'Koordinasi antara Tendik, dosen, dan pimpinan berjalan dengan baik.' },
      { id: 'A3', text: 'Beban kerja sebagai Tendik dirasakan sudah proporsional.' },
      { id: 'A4', text: 'Sarana kerja sangat mendukung pelaksanaan tugas Tendik.' }
    ]
  },
  {
    title: 'II. Dukungan Terhadap Kegiatan Penelitian',
    items: [
      { id: 'B1', text: 'Tendik dilibatkan dalam mendukung administrasi penelitian.' },
      { id: 'B2', text: 'Prosedur administrasi penelitian jelas and mudah diikuti.' },
      { id: 'B3', text: 'Sistem informasi penelitian mudah digunakan.' }
    ]
  },
  {
    title: 'III. Dukungan Terhadap Pengabdian Kepada Masyarakat (PKM)',
    items: [
      { id: 'C1', text: 'Tendik berperan dalam mendukung administrasi kegiatan PKM.' },
      { id: 'C2', text: 'Prosedur administrasi PKM jelas and efisien.' }
    ]
  },
  {
    title: 'IV. Layanan Administrasi & Sistem Informasi',
    items: [
      { id: 'D1', text: 'Sistem informasi akademik/non-akademik mendukung pekerjaan Tendik.' },
      { id: 'D2', text: 'Prosedur layanan administrasi mudah dipahami.' },
      { id: 'D3', text: 'Pelatihan and pengembangan kompetensi Tendik memadai.' },
      { id: 'D4', text: 'Lingkungan kerja mendukung kinerja Tendik secara optimal.' }
    ]
  },
  {
    title: 'V. Tata Kelola, Akuntabilitas, & Kepuasan Kerja',
    items: [
      { id: 'E1', text: 'Kebijakan institusi disampaikan secara transparan.' },
      { id: 'E2', text: 'Pimpinan responsif terhadap masukan dari Tendik.' },
      { id: 'E3', text: 'Sistem penilaian kinerja Tendik dilakukan secara objektif.' },
      { id: 'E4', text: 'Penghargaan and kesejahteraan Tendik dirasakan memadai.' }
    ]
  }
]

const options = [
  { value: 4, label: 'Sangat Baik (SB)', description: 'Sangat Jelas / Sangat Mendukung' },
  { value: 3, label: 'Baik (B)', description: 'Jelas / Mendukung' },
  { value: 2, label: 'Cukup (C)', description: 'Kurang Jelas / Kurang Mendukung' },
  { value: 1, label: 'Kurang Baik (KB)', description: 'Tidak Jelas / Tidak Mendukung' }
]

const modal = reactive({
  show: false,
  title: '',
  message: '',
  type: 'info' as 'info' | 'error'
})

const showModal = (title: string, message: string, type: 'info' | 'error' = 'info') => {
  modal.title = title
  modal.message = message
  modal.type = type
  modal.show = true
}

const submitSurvey = async () => {
  // Simple validation
  const requiredFields = ['unit_kerja', 'jabatan', 'status_kepegawaian', 'masa_kerja']
  for (const field of requiredFields) {
    if (!form.identitas[field as keyof typeof form.identitas]) {
      showModal('Data Belum Lengkap', `Mohon lengkapi data identitas: ${field.replace('_', ' ')}`, 'error')
      return
    }
  }

  // Check all ratings
  const ratings = Object.entries(form.penilaian)
  const isAllRated = ratings.every(([_, val]) => Number(val) > 0)
  if (!isAllRated) {
    showModal('Penilaian Belum Lengkap', 'Mohon isi semua pernyataan penilaian dengan memberikan skor (1-4).', 'error')
    return
  }

  // Check declaration
  if (!form.deklarasi) {
    showModal('Pernyataan Diperlukan', 'Silakan centang pernyataan pernyataan di bagian bawah sebelum mengirim.', 'error')
    return
  }

  isSubmitting.value = true
  try {
    const response = await $fetch('/api/kepegawaian/survei/submit', {
      method: 'POST',
      body: form
    })
    
    if ((response as any).success) {
      isSubmitted.value = true
    } else {
      showModal('Gagal Mengirim', (response as any).message, 'error')
    }
  } catch (err: any) {
    showModal('Kesalahan Server', 'Gagal memproses permintaan. Silakan hubungi admin.', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="survey-page">
    <div class="survey-container">
      <!-- Header Section -->
      <header class="survey-header">
        <NuxtLink to="/kepegawaian" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Kembali ke Dashboard
        </NuxtLink>
        <div class="header-main">
          <div class="badge">SYARAT AKREDITASI</div>
          <h1>Survei Kepuasan Tendik</h1>
          <p>Instrumen evaluasi dukungan sistem terhadap pelaksanaan Tri Dharma Perguruan Tinggi.</p>
        </div>
      </header>

      <div v-if="!isSubmitted" class="survey-form">
        <!-- Section A: Identitas -->
        <section class="form-section glass-card">
          <div class="section-title">
            <span class="number">A</span>
            <h3>Identitas Responden</h3>
          </div>
          <div class="input-grid">
            <div class="input-group required">
              <label>Tahun Pengisian</label>
              <select v-model="form.identitas.tahun">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
            <div class="input-group required">
              <label>Jabatan</label>
              <input v-model="form.identitas.jabatan" type="text" placeholder="Contoh: Staff Administrasi" required />
            </div>
            <div class="input-group">
              <label>Nama (Opsional)</label>
              <input v-model="form.identitas.nama" type="text" placeholder="Masukkan nama Anda..." />
            </div>
            <div class="input-group required">
              <label>Unit Kerja</label>
              <input v-model="form.identitas.unit_kerja" type="text" placeholder="Contoh: Biro Akademik" required />
            </div>
            <div class="input-group required">
              <label>Status Kepegawaian</label>
              <input v-model="form.identitas.status_kepegawaian" type="text" placeholder="Loading status..." readonly />
            </div>
            <div class="input-group required">
              <label>Masa Kerja</label>
              <input v-model="form.identitas.masa_kerja" type="text" placeholder="Loading masa kerja..." readonly />
            </div>
          </div>
        </section>

        <!-- Section B: Petunjuk -->
        <div class="petunjuk glass-card">
          <div class="p-icon">ℹ️</div>
          <div class="p-text">
            <strong>Petunjuk Pengisian:</strong>
            <p>Berilah penilaian terhadap pernyataan-pernyataan di bawah ini dengan memilih salah satu angka (1 s/d 4) yang paling sesuai dengan kondisi yang Anda rasakan.</p>
          </div>
        </div>

        <!-- Section C: Item Penilaian -->
        <section v-for="(section, sIdx) in sections" :key="sIdx" class="form-section instrument-section glass-card">
          <div class="section-title">
            <h3>{{ section.title }}</h3>
          </div>
          <div class="instrument-list">
            <div v-for="item in section.items" :key="item.id" class="instrument-item">
              <div class="item-text">{{ item.text }}</div>
              <div class="item-options">
                <label v-for="opt in options" :key="opt.value" class="option-radio" :title="opt.description">
                  <input type="radio" :name="item.id" :value="opt.value" v-model="(form.penilaian as any)[item.id]" />
                  <span class="radio-custom">{{ opt.value }}</span>
                  <span class="radio-label">{{ opt.label }}</span>
                </label>
              </div>
            </div>
            <!-- Optional field after A2 -->
            <div v-if="section.title.includes('Pendidikan')" class="input-group mt-6">
              <label>Nama Atasan / Pimpinan (Opsional)</label>
              <input v-model="form.pimpinan_atasan" type="text" placeholder="Masukkan nama atasan langsung..." />
            </div>
          </div>
        </section>

        <!-- Section D: Pertanyaan Terbuka -->
        <section class="form-section glass-card">
          <div class="section-title">
            <span class="number">D</span>
            <h3>Pertanyaan Terbuka</h3>
          </div>
          <div class="input-stack">
            <div class="input-group required">
              <label>Aspek yang paling Memuaskan dalam pelaksanaan tugas tugas Anda dan dukungan Institusi bagi pelaksanaan pendidikan, penelitian, dan pengabdian masyarakat!</label>
              <textarea v-model="form.terbuka.aspek_memuaskan" rows="4" placeholder="Tuliskan jawaban Anda..." required></textarea>
            </div>
            <div class="input-group required">
              <label>Aspek yang Perlu Ditingkatkan oleh institusi!</label>
              <textarea v-model="form.terbuka.aspek_ditingkatkan" rows="4" placeholder="Tuliskan jawaban Anda..." required></textarea>
            </div>
            <div class="input-group required">
              <label>Saran perbaikan untuk peningkatan kinerja dan layanan pendidikan, penelitian, dan pengabdian masyarakat!</label>
              <textarea v-model="form.terbuka.saran_perbaikan" rows="4" placeholder="Tuliskan jawaban Anda..." required></textarea>
            </div>
          </div>
        </section>

        <!-- Declaration Checkbox -->
        <section class="form-section glass-card declaration-section mt-6">
          <label class="declaration-label">
            <input type="checkbox" v-model="form.deklarasi" required />
            <span class="deklarasi-text">Saya menyatakan bahwa data identitas dan penilaian yang saya berikan dalam survei ini adalah BENAR dan dapat dipertanggungjawabkan.</span>
          </label>
        </section>

        <!-- Submit Button -->
        <div class="submit-container mt-12">
          <button 
            @click="submitSurvey" 
            :disabled="isSubmitting"
            class="btn-submit-lux"
          >
            <span v-if="!isSubmitting">Kirim Instrumen Survei ✨</span>
            <span v-else class="loader-inline">Mengirim...</span>
          </button>
          <p class="text-muted mt-4">Pastikan semua poin penilaian telah terisi dengan teliti.</p>
        </div>
      </div>

      <!-- Success State -->
      <div v-else class="success-state animated-fade">
        <div class="success-icon">✓</div>
        <h2>Terima Kasih!</h2>
        <p>Data survei Anda telah berhasil tersimpan dalam pangkalan data penjaminan mutu. Partisipasi Anda sangat berharga bagi peningkatan tata kelola institusi.</p>
        <NuxtLink to="/kepegawaian" class="btn-primary">Kembali ke Dashboard</NuxtLink>
      </div>
    </div>

    <!-- Alert Modal -->
    <Teleport to="body">
      <div v-if="modal.show" class="modal-overlay" @click.self="modal.show = false">
        <div class="modal-card glass-card">
          <div :class="['modal-icon', modal.type]">
            <span v-if="modal.type === 'error'">⚠️</span>
            <span v-else>ℹ️</span>
          </div>
          <h3>{{ modal.title }}</h3>
          <p>{{ modal.message }}</p>
          <button @click="modal.show = false" class="btn-modal">Tutup</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.survey-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 3rem 1rem 6rem;
  color: #1e293b;
}

.survey-container {
  max-width: 900px;
  margin: 0 auto;
}

.survey-header {
  margin-bottom: 3rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  transition: 0.2s;
}

.back-link svg { width: 16px; height: 16px; }
.back-link:hover { color: #4f46e5; transform: translateX(-4px); }

.header-main .badge {
  display: inline-block;
  background: #eef2ff;
  color: #4f46e5;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.header-main h1 {
  font-size: 2.5rem;
  font-weight: 950;
  background: linear-gradient(135deg, #1e293b 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.header-main p {
  color: #64748b;
  font-size: 1.1rem;
  max-width: 600px;
  line-height: 1.6;
}

/* Form Styles */
.form-section {
  padding: 2.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255,255,255,0.7);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-title .number {
  background: #4f46e5;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.section-title h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.input-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
}

.input-group.required label::after {
  content: " *";
  color: #ef4444;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #1e293b;
  font-size: 0.95rem;
  transition: all 0.2s;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

textarea { resize: vertical; }

.petunjuk {
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  background: #eef2ff;
  border: 1px solid #dbeafe;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.p-icon { font-size: 1.5rem; }
.p-text strong { display: block; margin-bottom: 4px; color: #4338ca; }
.p-text p { font-size: 0.9rem; color: #475569; margin: 0; }

/* Instrument Styles */
.instrument-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.instrument-item {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.item-text {
  font-weight: 600;
  font-size: 1rem;
  color: #334155;
  line-height: 1.5;
}

.item-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.option-radio {
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.2s;
}

.option-radio:hover {
  background: white;
  border-color: #cbd5e1;
}

.option-radio input {
  position: absolute;
  opacity: 0;
}

.radio-custom {
  width: 32px;
  height: 32px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #64748b;
  margin-bottom: 8px;
  transition: 0.2s;
}

.radio-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #94a3b8;
  text-align: center;
  text-transform: uppercase;
}

.option-radio input:checked + .radio-custom {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
  box-shadow: 0 0 15px rgba(79, 70, 229, 0.4);
}

.option-radio input:checked + .radio-custom + .radio-label {
  color: #4f46e5;
}

.option-radio:has(input:checked) {
  background: white;
  border-color: #4f46e5;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.form-actions {
  text-align: center;
  padding: 2rem 0;
}

.submit-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
  color: white;
  border: none;
  padding: 1.25rem 3rem;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
  transition: all 0.3s;
  margin-bottom: 1.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(79, 70, 229, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.disclaimer {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
  max-width: 500px;
  margin: 0 auto;
}

.success-state {
  text-align: center;
  padding: 5rem 3rem;
  background: white;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.success-state h2 {
  font-size: 2.5rem;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 1rem;
}

.success-state p {
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto 3rem;
}

.btn-primary {
  display: inline-block;
  background: #4f46e5;
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  transition: 0.3s;
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.mt-6 { margin-top: 1.5rem; }

.animated-entrance {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.declaration-section { display: flex; align-items: center; padding: 1.5rem; background: rgba(255, 255, 255, 0.4); border: 2px solid rgba(79, 70, 229, 0.2); }
.declaration-label { display: flex; align-items: flex-start; gap: 1rem; cursor: pointer; color: #1e293b; font-weight: 600; line-height: 1.5; }
.declaration-label input { width: 22px; height: 22px; margin-top: 2px; cursor: pointer; }
.deklarasi-text { font-size: 1rem; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { max-width: 450px; width: 100%; padding: 2.5rem; text-align: center; background: white; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.3); animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes modalIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.modal-icon { font-size: 3.5rem; margin-bottom: 1.5rem; display: inline-block; }
.modal-icon.error span { text-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }

.modal-card h3 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 1rem; }
.modal-card p { color: #64748b; margin-bottom: 2rem; line-height: 1.6; font-weight: 500; }
.btn-modal { width: 100%; background: #4f46e5; color: white; padding: 1rem; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
.btn-modal:hover { background: #4338ca; transform: translateY(-2px); }

@media (max-width: 640px) {
  .input-grid { grid-template-columns: 1fr; }
  .item-options { grid-template-columns: repeat(2, 1fr); }
  .header-main h1 { font-size: 2rem; }
  .form-section { padding: 1.5rem; }
}
</style>
