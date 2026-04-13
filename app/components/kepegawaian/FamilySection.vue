<script setup lang="ts">
import { ref } from 'vue'
const { showAlert } = useAlert()
const props = defineProps<{
  nik: string
  familyData: any
}>()

const emit = defineEmits(['refresh'])

const isEditing = ref(false)
const form = ref({
  status_perkawinan: props.familyData?.[0]?.status_perkawinan || '',
  nama_ismi: props.familyData?.[0]?.nama_ismi || '',
  pekerjaan_ismi: props.familyData?.[0]?.pekerjaan_ismi || '',
})

const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)

const handleUpdate = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('nik', props.nik)
    formData.append('status_perkawinan', form.value.status_perkawinan)
    formData.append('nama_ismi', form.value.nama_ismi)
    formData.append('pekerjaan_ismi', form.value.pekerjaan_ismi)
    
    if (fileInput.value?.files?.[0]) {
      formData.append('upload_kk', fileInput.value.files[0])
    }

    const id = props.familyData?.[0]?.id_keluarga
    const url = id 
        ? `/api/kepegawaian/riwayat/riwayat_keluarga/${id}`
        : `/api/kepegawaian/riwayat/riwayat_keluarga`
    
    const method = id ? 'PUT' : 'POST'

    // @ts-ignore
    const response = await $fetch<any>(url, {
      method,
      body: formData
    })

    if (response.success) {
      showAlert(`Data keluarga berhasil ${id ? 'diperbarui' : 'disimpan'}`, 'success')
      isEditing.value = false
      emit('refresh')
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="family-section">
    <div class="section-header">
      <h3>Riwayat Keluarga</h3>
      <button @click="isEditing = !isEditing" class="btn-edit">
        {{ isEditing ? 'Batal' : 'Edit Keluarga' }}
      </button>
    </div>

    <div v-if="!isEditing" class="info-grid">
      <div v-if="familyData?.[0]">
        <div class="info-item">
          <label>Status Perkawinan</label>
          <span>{{ familyData[0].status_perkawinan }}</span>
        </div>
        <div class="info-item">
          <label>Nama Pasangan</label>
          <span>{{ familyData[0].nama_ismi || '-' }}</span>
        </div>
        <div class="info-item">
          <label>Pekerjaan Pasangan</label>
          <span>{{ familyData[0].pekerjaan_ismi || '-' }}</span>
        </div>
        <div class="info-item" v-if="familyData[0].upload_kk">
          <label>Kartu Keluarga (KK)</label>
          <a :href="`/assets/kk/${familyData[0].upload_kk}`" target="_blank" class="btn-link">Lihat Dokumen</a>
        </div>
      </div>
      <div v-else class="empty-tab">Tidak ada riwayat keluarga.</div>
    </div>

    <form v-else @submit.prevent="handleUpdate" class="premium-form">
      <div class="form-grid">
        <div class="form-group">
          <label>Status Perkawinan</label>
          <select v-model="form.status_perkawinan" class="glass-input">
            <option value="Belum Kawin">Belum Kawin</option>
            <option value="Kawin">Kawin</option>
            <option value="Cerai Hidup">Cerai Hidup</option>
            <option value="Cerai Mati">Cerai Mati</option>
          </select>
        </div>
        <div class="form-group">
          <label>Nama Pasangan</label>
          <input v-model="form.nama_ismi" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Pekerjaan Pasangan</label>
          <input v-model="form.pekerjaan_ismi" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Upload KK (JPG/PNG/PDF)</label>
          <input type="file" ref="fileInput" class="glass-input" accept=".jpg,.jpeg,.png,.pdf" />
        </div>
      </div>
      <div class="form-footer">
        <button type="submit" :disabled="loading" class="btn-primary-lux">
          <span v-if="!loading">{{ familyData?.[0]?.id_keluarga ? 'Perbarui Data Keluarga' : 'Simpan Data Keluarga' }}</span>
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.info-grid, .form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item, .form-group {
  display: flex;
  flex-direction: column;
}

.info-item label, .form-group label {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.info-item span {
  font-size: 1.1rem;
  font-weight: 500;
}

.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  padding: 0.75rem;
  border-radius: 0.5rem;
  outline: none;
}

.form-footer { margin-top: 2rem; display: flex; justify-content: flex-end; }
.premium-table { width: 100%; border-collapse: collapse; }

.btn-primary-lux {
  background: var(--primary);
  border: none;
  color: #1e293b;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.btn-link {
  color: var(--primary);
  text-decoration: underline;
  font-weight: 600;
}

.empty-tab {
  grid-column: span 2;
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}
</style>
