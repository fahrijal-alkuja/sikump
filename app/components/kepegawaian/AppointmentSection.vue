<script setup lang="ts">
import { ref } from 'vue'
const { showAlert } = useAlert()
const props = defineProps<{
  nik: string
  appointmentData: any
}>()

const emit = defineEmits(['refresh'])

const isEditing = ref(false)

const preview = ref({ show: false, url: '', title: '' })
const openPreview = (url: string, title: string) => {
  preview.value = { show: true, url, title }
}
const form = ref({
  status_kepegawaian: props.appointmentData?.[0]?.status_kepegawaian || '',
  status_keaktivan: props.appointmentData?.[0]?.status_keaktivan || '',
  tmt: props.appointmentData?.[0]?.tmt || '',
  penempatan: props.appointmentData?.[0]?.penempatan || '',
  nomor_sk: props.appointmentData?.[0]?.nomor_sk || '',
  lembaga_pengangkat: props.appointmentData?.[0]?.lembaga_pengangkat || '',
  sumber_gaji: props.appointmentData?.[0]?.sumber_gaji || '',
})

const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)

const handleUpdate = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('nik', props.nik)
    for (const key in form.value) {
      formData.append(key, (form.value as any)[key])
    }
    
    if (fileInput.value?.files?.[0]) {
      formData.append('upload_sk', fileInput.value.files[0])
    }

    const id = props.appointmentData?.[0]?.id
    const url = id 
        ? `/api/kepegawaian/riwayat/riwayat_pengangkatan/${id}`
        : `/api/kepegawaian/riwayat/riwayat_pengangkatan`
    
    const method = id ? 'PUT' : 'POST'

    // @ts-ignore
    const response = await $fetch<any>(url, {
      method,
      body: formData
    })

    if (response.success) {
      showAlert(`Data pengangkatan berhasil ${id ? 'diperbarui' : 'disimpan'}`, 'success')
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
  <div class="appointment-section">
    <KepegawaianDocumentPreview 
      :show="preview.show" 
      :title="preview.title" 
      :file-url="preview.url" 
      @close="preview.show = false" 
    />
    <div class="section-header">
      <h3>Riwayat Kepegawaian / Pengangkatan</h3>
      <button @click="isEditing = !isEditing" class="btn-edit">
        {{ isEditing ? 'Batal' : 'Edit Kepegawaian' }}
      </button>
    </div>

    <div v-if="!isEditing" class="info-grid">
      <div v-if="appointmentData?.[0]">
        <div class="info-item">
          <label>Status Kepegawaian</label>
          <span>{{ appointmentData[0].status_kepegawaian }}</span>
        </div>
        <div class="info-item">
          <label>Status Keaktifan</label>
          <span>{{ appointmentData[0].status_keaktivan }}</span>
        </div>
        <div class="info-item">
          <label>TMT</label>
          <span>{{ appointmentData[0].tmt || '-' }}</span>
        </div>
        <div class="info-item">
          <label>Penempatan</label>
          <span>{{ appointmentData[0].penempatan || '-' }}</span>
        </div>
        <div class="info-item">
          <label>Nomor SK</label>
          <span>{{ appointmentData[0].nomor_sk || '-' }}</span>
        </div>
        <div class="info-item" v-if="appointmentData[0].upload_sk">
          <label>File SK</label>
          <button @click="openPreview(`/assets/SK/${appointmentData[0].upload_sk}`, 'SK Pengangkatan')" class="btn-link-lux">Lihat SK</button>
        </div>
      </div>
      <div v-else class="empty-tab">Tidak ada riwayat pengangkatan.</div>
    </div>

    <form v-else @submit.prevent="handleUpdate" class="premium-form">
      <div class="form-grid">
        <div class="form-group">
          <label>Status Kepegawaian</label>
          <input v-model="form.status_kepegawaian" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Status Keaktifan</label>
          <input v-model="form.status_keaktivan" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>TMT</label>
          <input v-model="form.tmt" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Penempatan</label>
          <input v-model="form.penempatan" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Nomor SK</label>
          <input v-model="form.nomor_sk" type="text" class="glass-input" />
        </div>
        <div class="form-group">
          <label>Upload SK (JPG/PNG/PDF)</label>
          <input type="file" ref="fileInput" class="glass-input" accept=".jpg,.jpeg,.png,.pdf" />
        </div>
      </div>
      <div class="form-footer">
        <button type="submit" :disabled="loading" class="btn-primary-lux">
          <span v-if="!loading">{{ appointmentData?.[0]?.id ? 'Perbarui Data Kepegawaian' : 'Simpan Data Kepegawaian' }}</span>
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

.btn-link-lux {
  background: none;
  border: none;
  color: var(--primary);
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-align: left;
}

.empty-tab {
  grid-column: span 2;
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}
</style>
