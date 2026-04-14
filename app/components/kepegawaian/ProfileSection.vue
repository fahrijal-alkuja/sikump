<script setup lang="ts">
import { ref, watch, computed } from 'vue'
const { showAlert } = useAlert()
const props = defineProps<{
  employee: any
}>()

const emit = defineEmits(['refresh'])

const isEditing = ref(false)
const form = ref({ ...props.employee })

// Fetch References for Unit/Prodi
const { data: biroData } = await useFetch<any>('/api/kepegawaian/biro')
const { data: prodiData } = await useFetch<any>('/api/kepegawaian/prodi')

const bureaus = computed(() => biroData.value?.data || [])
const prodis = computed(() => prodiData.value?.data || [])

const parseLegacyDate = (dateStr: string) => {
  if (!dateStr) return ''
  // If it's already YYYY-MM-DD... just take the date part
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateStr.substring(0, 10)
  }
  
  const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-')
  if (parts.length !== 3) return ''
  const day = (parts[0] || '').padStart(2, '0')
  const month = (parts[1] || '').padStart(2, '0')
  const year = parts[2] || ''
  return `${year}-${month}-${day}`
}

// Prepare form when editing starts
watch(isEditing, (val) => {
  if (val) {
    const e = props.employee
    // Find current unit_id
    const currentUnit = e.type === 'dosen' ? e.kode_program_studi : e.riwayat_jabatan?.find((j: any) => j.is_aktiv === 'Y')?.id_biro

    form.value = { 
      ...e,
      unit_id: currentUnit || '',
      tanggal_lahir: e.tanggal_lahir ? parseLegacyDate(e.tanggal_lahir) : ''
    }
  }
})

const loading = ref(false)

const preview = ref({
  show: false,
  url: '',
  title: ''
})

const openPreview = (url: string, title: string) => {
  preview.value = { show: true, url, title }
}

const handleUpdate = async () => {
  loading.value = true
  try {
    // @ts-ignore
    const response = await $fetch<any>(`/api/kepegawaian/${props.employee.nik}`, {
      method: 'PUT',
      body: {
        ...form.value,
        type: props.employee.type || 'dosen'
      }
    })

    if (response.success) {
      isEditing.value = false
      showAlert('Profil berhasil diperbarui!', 'success')
      emit('refresh')
    } else {
      showAlert('Gagal memperbarui profil: ' + (response.message || 'Error tidak diketahui'), 'error')
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="profile-section">
    <div class="section-header">
      <h3>Informasi Pribadi</h3>
      <button @click="isEditing = !isEditing" class="btn-edit">
        {{ isEditing ? 'Batal' : 'Edit Profil' }}
      </button>
    </div>

    <div v-if="!isEditing" class="info-grid">
      <div class="info-item avatar-item" v-if="employee.pp">
        <label>Foto Profil</label>
        <div class="thumb-wrapper" @click="openPreview(`/assets/foto/${employee.pp}`, 'Foto Profil')">
          <img :src="`/assets/foto/${employee.pp}`" class="profile-thumb" />
          <div class="thumb-overlay">Lihat</div>
        </div>
      </div>
      
      <DocumentPreview 
        :show="preview.show" 
        :title="preview.title" 
        :file-url="preview.url" 
        @close="preview.show = false" 
      />
      <div class="info-item">
        <label>NIK</label>
        <span>{{ employee.nik }}</span>
      </div>
      <div class="info-item" v-if="employee.nidn">
        <label>NIDN</label>
        <span>{{ employee.nidn }}</span>
      </div>
      <div class="info-item" v-if="employee.nuptk">
        <label>NUPTK</label>
        <span>{{ employee.nuptk }}</span>
      </div>
      <div class="info-item">
        <label>
          No. KTP
          <button v-if="employee.upload_ktp" @click="openPreview(`/assets/KTP/${employee.upload_ktp}`, 'Dokumen KTP')" class="btn-view-ktp">
            (Lihat Dokumen)
          </button>
        </label>
        <span>{{ employee.nomor_ktp || '-' }}</span>
      </div>
      <div class="info-item">
        <label>Nama Lengkap</label>
        <span>{{ employee.nama }}</span>
      </div>
      <div class="info-item">
        <label>Jenis Kelamin</label>
        <span>{{ employee.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}</span>
      </div>
      <div class="info-item">
        <label>Tempat, Tgl Lahir</label>
        <span>{{ employee.tempat_lahir }}, {{ employee.tanggal_lahir ? new Date(employee.tanggal_lahir).toLocaleDateString('id-ID') : '-' }}</span>
      </div>
      <div class="info-item">
        <label>Agama</label>
        <span>{{ employee.agama || '-' }}</span>
      </div>
      <div class="info-item">
        <label>Nama Ibu Kandung</label>
        <span>{{ employee.nama_ibu_kandung || '-' }}</span>
      </div>
      <div class="info-item">
        <label>Status Ikatan Kerja</label>
        <span :class="['status-pill', `status-${employee.status_aktif}`]">
          {{ employee.status_aktif === '1' ? 'Aktif' : 
             employee.status_aktif === '2' ? 'Tugas Belajar' : 
             employee.status_aktif === '3' ? 'Izin Belajar' : 
             employee.status_aktif === '4' ? 'Cuti' : 'Non-Aktif' }}
        </span>
      </div>
      <div class="info-item" v-if="employee.status_aktif === '2'">
        <label>Tgl Selesai Tugas Belajar</label>
        <span class="text-danger">{{ employee.tgl_selesai_studi ? new Date(employee.tgl_selesai_studi).toLocaleDateString('id-ID') : '-' }}</span>
      </div>
      <div class="info-item">
        <label>Telepon</label>
        <span>{{ employee.telepon || '-' }}</span>
      </div>
      <div class="info-item full-width">
        <label>Alamat</label>
        <span>{{ employee.alamat || '-' }}</span>
      </div>
    </div>

    <form v-else @submit.prevent="handleUpdate" class="premium-form">
      <div class="form-grid">
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input v-model="form.nama" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>No. KTP</label>
          <input v-model="form.nomor_ktp" type="text" class="glass-input" />
        </div>
        <div class="form-group" v-if="employee.type === 'dosen'">
          <label>Program Studi</label>
          <select v-model="form.unit_id" class="glass-input">
            <option value="">Pilih Prodi</option>
            <option v-for="p in prodis" :key="p.id" :value="p.id">{{ p.nama }}</option>
          </select>
        </div>
        <div class="form-group" v-else>
          <label>Unit Kerja / Biro</label>
          <select v-model="form.unit_id" class="glass-input">
            <option value="">Pilih Unit</option>
            <option v-for="b in bureaus" :key="b.id" :value="b.id">{{ b.nama }}</option>
          </select>
        </div>
        <div class="form-group" v-if="form.nidn !== undefined">
          <label>NIDN</label>
          <input v-model="form.nidn" type="text" class="glass-input" />
        </div>
        <div class="form-group" v-if="form.nuptk !== undefined">
          <label>NUPTK</label>
          <input v-model="form.nuptk" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Jenis Kelamin</label>
          <select v-model="form.jenis_kelamin" class="glass-input">
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div class="form-group">
          <label>Agama</label>
          <input v-model="form.agama" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Tempat Lahir</label>
          <input v-model="form.tempat_lahir" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Tanggal Lahir</label>
          <input v-model="form.tanggal_lahir" type="date" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Telepon</label>
          <input v-model="form.telepon" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Nama Ibu Kandung</label>
          <input v-model="form.nama_ibu_kandung" type="text" class="glass-input" placeholder="Wajib untuk PDDikti" />
        </div>
        <div class="form-group">
          <label>Status Ikatan Kerja</label>
          <select v-model="form.status_aktif" class="glass-input">
            <option value="1">Aktif</option>
            <option value="2">Tugas Belajar</option>
            <option value="3">Izin Belajar</option>
            <option value="4">Cuti</option>
            <option value="5">Keluar / Non-Aktif</option>
          </select>
        </div>
        <div class="form-group" v-if="form.status_aktif === '2'">
          <label>Tgl Selesai Tugas Belajar</label>
          <input v-model="form.tgl_selesai_studi" type="date" class="glass-input" />
        </div>
        <div class="form-group full-width">
          <label>Alamat</label>
          <textarea v-model="form.alamat" class="glass-input"></textarea>
        </div>
      </div>
      <div class="form-footer">
        <button type="submit" :disabled="loading" :class="['btn-primary-lux', { 'is-loading': loading }]">
          <span v-if="!loading">Update Profil</span>
          <div v-else class="spinner-small"></div>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-edit {
  background: white;
  border: 1px solid var(--glass-border);
  color: var(--primary);
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.btn-edit:hover {
  background: var(--primary);
  color: #1e293b;
  transform: translateY(-1px);
}

.info-grid, .form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.info-item, .form-group {
  display: flex;
  flex-direction: column;
}

.info-item.full-width, .form-group.full-width {
  grid-column: span 2;
}

.info-item label, .form-group label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}

.info-item span {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e293b;
}

.profile-thumb {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 2px solid var(--glass-border);
}

.thumb-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
  border-radius: 0.5rem;
  overflow: hidden;
}

.thumb-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(99, 102, 241, 0.6);
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s;
}

.thumb-wrapper:hover .thumb-overlay {
  opacity: 1;
}

.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  padding: 0.75rem;
  border-radius: 0.5rem;
  outline: none;
}

.form-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.btn-primary-lux {
  background: linear-gradient(135deg, var(--primary), #4f46e5);
  border: none;
  color: #1e293b;
  padding: 0.85rem 2.5rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  position: relative;
  overflow: hidden;
}

.btn-primary-lux:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
}

.btn-primary-lux:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* SPINNER CSS */
.spinner-small {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #1e293b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  width: fit-content;
}
.status-1 { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-2 { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.status-3 { background: rgba(167, 139, 250, 0.1); color: #a78bfa; }
.status-4, .status-5 { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.text-danger { color: #ef4444; font-weight: 700; }
.btn-view-ktp {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}
.btn-view-ktp:hover {
  color: #1e293b;
  text-decoration: underline;
}
</style>
