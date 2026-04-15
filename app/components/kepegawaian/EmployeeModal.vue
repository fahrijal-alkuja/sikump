<script setup lang="ts">
import { ref, watch, computed } from 'vue'
const { showAlert } = useAlert()

const props = defineProps<{
  show: boolean
  type: '1' | '2' // 1: Dosen, 2: Tendik
  employee?: any  // Optional for Edit Mode
}>()

const emit = defineEmits(['close', 'success'])
const loading = ref(false)
const ktpFile = ref<HTMLInputElement | null>(null)

const alert = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

const form = ref({
  nik: '',
  nama: '',
  nuptk: '',
  nidn: '',
  unit_id: '',
  jenis_kelamin: 'L',
  tempat_lahir: '',
  tanggal_lahir: '',
  telepon: '',
  alamat: '',
  pendidikan: '',
  ikatan_kerja: props.type
})

// Fetch Reference Data
const { data: biroData } = await useFetch<any>('/api/kepegawaian/biro')
const { data: prodiData } = await useFetch<any>('/api/kepegawaian/prodi')

const bureaus = computed(() => biroData.value?.data || [])
const prodis = computed(() => prodiData.value?.data || [])

const isEdit = computed(() => !!props.employee)

// Sync form for Edit Mode
watch(() => props.show, (newVal) => {
  if (newVal && props.employee) {
    const e = props.employee
    form.value = {
      nik: e.nik,
      nama: e.nama,
      nuptk: e.nuptk || '',
      nidn: e.nidn || '',
      unit_id: e.kode_program_studi || e.id_biro || '',
      jenis_kelamin: e.jenis_kelamin || 'L',
      tempat_lahir: e.tempat_lahir || '',
      tanggal_lahir: e.tanggal_lahir ? parseLegacyDate(e.tanggal_lahir) : '',
      telepon: e.telepon || '',
      alamat: e.alamat || '',
      pendidikan: e.kode_jenjang_pendidikan || '',
      ikatan_kerja: props.type
    }
  } else if (newVal) {
    resetForm()
  }
})

const handleSubmit = async () => {
  if (!form.value.nik || !form.value.nama) return

  loading.value = true
  try {
    const targetNik = (form.value.nik || props.employee?.nik || '') as string
    const url = isEdit.value ? `/api/kepegawaian/${targetNik}` : '/api/kepegawaian'
    const method = isEdit.value ? 'PUT' : 'POST'

    const formData = new FormData()
    Object.keys(form.value).forEach(key => {
      const val = (form.value as any)[key]
      if (val !== null && val !== undefined) {
        formData.append(key, val)
      }
    })
    formData.append('type', props.type === '1' ? 'dosen' : 'tendik')
    if (ktpFile.value?.files?.[0]) formData.append('upload_ktp', ktpFile.value.files[0])

    const response = await $fetch<any>(url, {
      method,
      body: formData
    })
    
    if (response.success) {
      showAlert(`Data ${props.type === '1' ? 'Dosen' : 'Tendik'} berhasil ${isEdit.value ? 'diperbarui' : 'didaftarkan'}`, 'success')
      emit('success')
    } else {
      alert.value = { show: true, message: response.message || 'Terjadi kesalahan sistem', type: 'error' }
    }
  } catch (e: any) {
    alert.value = { show: true, message: 'Gagal menghubungi server. Pastikan koneksi stabil.', type: 'error' }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    nik: '', nama: '', nuptk: '', nidn: '', unit_id: '',
    jenis_kelamin: 'L', tempat_lahir: '', tanggal_lahir: '',
    telepon: '', alamat: '', pendidikan: '', ikatan_kerja: props.type
  }
}

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
</script>

<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-container glass-card">
          <div class="modal-header">
            <div>
              <h2>{{ isEdit ? 'Edit Data' : 'Tambah' }} {{ type === '1' ? 'Dosen' : 'Tendik' }}</h2>
              <p class="text-muted">{{ isEdit ? 'Perbarui informasi profil pegawai' : 'Masukkan rincian data pegawai baru' }}</p>
            </div>
            <button class="btn-close" @click="emit('close')">&times;</button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <div v-if="alert.show" :class="['alert-box', alert.type]">{{ alert.message }}</div>

            <div class="form-grid">
              <div class="form-group">
                <label>Nomor Induk Karyawan (NIK) *</label>
                <input v-model="form.nik" type="text" class="glass-input" :disabled="isEdit" required />
              </div>
              <div class="form-group">
                <label>Nama Lengkap & Gelar *</label>
                <input v-model="form.nama" type="text" class="glass-input" required />
              </div>

              <template v-if="type === '1'">
                <div class="form-group">
                  <label>NUPTK</label>
                  <input v-model="form.nuptk" type="text" class="glass-input" />
                </div>
                <div class="form-group">
                  <label>NIDN</label>
                  <input v-model="form.nidn" type="text" class="glass-input" />
                </div>
                <div class="form-group">
                  <label>Homebase (Program Studi)</label>
                  <select v-model="form.unit_id" class="glass-input">
                    <option value="">Pilih Prodi</option>
                    <option v-for="p in prodis" :key="p.id" :value="p.id">{{ p.nama }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Pendidikan Terakhir</label>
                  <select v-model="form.pendidikan" class="glass-input">
                    <option value="">Pilih Jenjang</option>
                    <option value="4">S1 - Sarjana</option>
                    <option value="5">S2 - Magister</option>
                    <option value="6">S3 - Doktor</option>
                  </select>
                </div>
              </template>

              <template v-else>
                <div class="form-group">
                  <label>Unit Kerja / Biro</label>
                  <select v-model="form.unit_id" class="glass-input">
                    <option value="">Pilih Unit</option>
                    <option v-for="b in bureaus" :key="b.id" :value="b.id">{{ b.nama }}</option>
                  </select>
                </div>
                <div class="form-group invisible"></div>
              </template>

              <div class="form-group">
                <label>Jenis Kelamin</label>
                <select v-model="form.jenis_kelamin" class="glass-input">
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div class="form-group">
                <label>Telepon / WA</label>
                <input v-model="form.telepon" type="text" class="glass-input" />
              </div>
              <div class="form-group">
                <label>Tempat Lahir</label>
                <input v-model="form.tempat_lahir" type="text" class="glass-input" />
              </div>
              <div class="form-group">
                <label>Tanggal Lahir</label>
                <input v-model="form.tanggal_lahir" type="date" class="glass-input" />
              </div>
              <div class="form-group full">
                <label>Upload KTP (Optional)</label>
                <input type="file" ref="ktpFile" class="glass-input" accept=".jpg,.jpeg,.png,.pdf" />
              </div>
              <div class="form-group full">
                <label>Alamat Lengkap</label>
                <textarea v-model="form.alamat" class="glass-input" rows="3"></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" @click="emit('close')" class="btn-ghost">Batal</button>
              <button type="submit" :disabled="loading" class="btn-primary">
                {{ loading ? 'Memproses...' : (isEdit ? 'Simpan Perubahan' : 'Daftarkan Pegawai') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(8, 8, 16, 0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
.modal-container { width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; background: #12121e; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 1.5rem; }
.modal-header { padding: 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 2rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.glass-input { background: rgba(255, 255, 255, 0.9); border: 1px solid var(--glass-border); color: #1e293b; padding: 0.75rem; border-radius: 0.75rem; outline: none; }
.glass-input:focus { border-color: var(--primary); }
.modal-footer { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-primary { background: var(--primary); color: white; padding: 0.75rem 2rem; border-radius: 0.75rem; border: none; font-weight: 700; cursor: pointer; }
.btn-ghost { background: transparent; color: var(--text-muted); border: none; cursor: pointer; font-weight: 600; }
.alert-box { 
  padding: 1rem 1.25rem; 
  border-radius: 12px; 
  margin-bottom: 2rem; 
  font-size: 0.9rem; 
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.alert-box.error { 
  background: rgba(239, 68, 68, 0.1); 
  color: #fca5a5; 
  border: 1px solid rgba(239, 68, 68, 0.2); 
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.05);
}

.alert-box::before {
  content: '⚠️';
  font-size: 1.1rem;
}
.modal-enter-active { transition: all 0.3s ease-out; }
.modal-enter-from { opacity: 0; transform: scale(0.95); }
.invisible { visibility: hidden; }
</style>
