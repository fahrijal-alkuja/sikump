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

const handleEdit = (item: any) => {
  form.value = {
    status_kepegawaian: item.status_kepegawaian,
    status_keaktivan: item.status_keaktivan,
    tmt: item.tmt,
    penempatan: item.penempatan,
    nomor_sk: item.nomor_sk,
    lembaga_pengangkat: item.lembaga_pengangkat,
    sumber_gaji: item.sumber_gaji,
  }
  isEditing.value = true
}

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

    <table class="premium-table">
      <thead>
        <tr>
          <th>Status Kepegawaian</th>
          <th>TMT</th>
          <th>Penempatan</th>
          <th>Nomor SK</th>
          <th class="text-center">SK</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in appointmentData" :key="item.id">
          <td class="name-highlight">
            {{ item.status_kepegawaian }}
            <span class="sub-label">{{ item.status_keaktivan }}</span>
          </td>
          <td>{{ item.tmt || '-' }}</td>
          <td>{{ item.penempatan || '-' }}</td>
          <td>{{ item.nomor_sk || '-' }}</td>
          <td class="text-center">
            <button v-if="item.upload_sk" @click="openPreview(`/assets/SK/${item.upload_sk}`, 'SK Pengangkatan')" class="btn-icon-view">📄</button>
            <span v-else class="text-muted">-</span>
          </td>
          <td class="table-actions">
            <button @click="handleEdit(item)" class="btn-edit-icon" title="Edit">✏️</button>
          </td>
        </tr>
        <tr v-if="!appointmentData || appointmentData.length === 0">
          <td colspan="6" class="text-center text-muted">Tidak ada riwayat pengangkatan.</td>
        </tr>
      </tbody>
    </table>

    <!-- MODAL FORM -->
    <div v-if="isEditing" class="modal-overlay">
      <div class="glass-card modal-box">
        <div class="modal-header">
          <h4>Edit Data Kepegawaian</h4>
          <button @click="isEditing = false" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="handleUpdate" class="premium-form">
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
              <label>TMT (Tanggal Mulai Tugas)</label>
              <input v-model="form.tmt" type="date" class="glass-input" />
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
              <span v-if="!loading">Update Data</span>
              <div v-else class="spinner-small"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
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
.premium-table { width: 100%; border-collapse: separate; border-spacing: 0 0.5rem; }
.premium-table th { text-align: left; padding: 1rem; color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.premium-table td { padding: 1.25rem 1rem; background: white; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
.premium-table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
.premium-table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 12px; border-bottom-right-radius: 12px; }

.name-highlight { font-weight: 800; color: #1e293b; display: flex; flex-direction: column; }
.sub-label { font-size: 0.7rem; color: #64748b; font-weight: 400; margin-top: 0.2rem; }

.btn-icon-view { background: none; border: none; font-size: 1.2rem; cursor: pointer; filter: grayscale(1); transition: 0.2s; }
.btn-icon-view:hover { filter: grayscale(0); transform: scale(1.1); }
.table-actions { display: flex; gap: 0.75rem; }
.btn-edit-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-box { width: 100%; max-width: 700px; padding: 2.5rem; animation: zoomIn 0.3s ease-out; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.modal-header h4 { font-size: 1.25rem; font-weight: 900; color: #1e293b; }
.btn-close { background: none; border: none; font-size: 2rem; color: #94a3b8; cursor: pointer; }

@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
