<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'success'])

const form = ref({
  nik: '',
  nama: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  jenis_kelamin: 'L',
  nomor_ktp: '',
  alamat: '',
  telepon: '',
  ikatan_kerja: '1' // '1' = Dosen, '2' = Tendik
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // @ts-ignore
    const response = await $fetch<any>('/api/kepegawaian', {
      method: 'POST',
      body: form.value
    })

    if (response.success) {
      emit('success')
      emit('close')
      // Reset form
      form.value = {
        nik: '',
        nama: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: 'L',
        nomor_ktp: '',
        alamat: '',
        telepon: '',
        ikatan_kerja: '1'
      }
    } else {
      error.value = response.message
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3>Tambah Karyawan Baru</h3>
        <button @click="emit('close')" class="btn-close">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="premium-form">
        <div class="form-grid">
          <div class="form-group">
            <label>NIK</label>
            <input v-model="form.nik" type="text" required class="glass-input" placeholder="Masukkan NIK" />
          </div>
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input v-model="form.nama" type="text" required class="glass-input" placeholder="Nama Lengkap" />
          </div>
          <div class="form-group">
            <label>No. KTP</label>
            <input v-model="form.nomor_ktp" type="text" class="glass-input" placeholder="No. KTP" />
          </div>
          <div class="form-group">
            <label>Jenis Kelamin</label>
            <select v-model="form.jenis_kelamin" class="glass-input">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tempat Lahir</label>
            <input v-model="form.tempat_lahir" type="text" class="glass-input" placeholder="Tempat Lahir" />
          </div>
          <div class="form-group">
            <label>Tanggal Lahir</label>
            <input v-model="form.tanggal_lahir" type="date" class="glass-input" />
          </div>
          <div class="form-group full-width">
            <label>Alamat</label>
            <textarea v-model="form.alamat" class="glass-input" placeholder="Alamat Lengkap"></textarea>
          </div>
          <div class="form-group">
            <label>Ikatan Kerja (Kategori)</label>
            <select v-model="form.ikatan_kerja" class="glass-input">
              <option value="1">Dosen</option>
              <option value="2">Tenaga Kependidikan (Tendik)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Telepon</label>
            <input v-model="form.telepon" type="text" class="glass-input" placeholder="No. Telepon" />
          </div>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <div class="modal-footer">
          <button type="button" @click="emit('close')" class="btn-secondary">Batal</button>
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Menyimpan...' : 'Simpan Data' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600px;
  padding: 2rem;
  border: 1px solid var(--glass-border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.glass-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--glass-border);
  color: #1e293b;
  padding: 0.75rem;
  border-radius: 0.5rem;
  outline: none;
}

.glass-input:focus {
  border-color: var(--primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.error-msg {
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary);
  border: none;
  color: white;
}

.btn-secondary {
  background: none;
  border: 1px solid var(--glass-border);
  color: var(--text-main);
}
</style>
