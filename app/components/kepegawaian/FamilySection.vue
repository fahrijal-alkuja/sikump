<script setup lang="ts">
import { ref } from 'vue'
const { showAlert } = useAlert()
const props = defineProps<{
  nik: string
  familyData: any
}>()

const emit = defineEmits(['refresh'])

const isEditing = ref(false)

const preview = ref({ show: false, url: '', title: '' })
const openPreview = (url: string, title: string) => {
  preview.value = { show: true, url, title }
}
const form = ref({
  status_perkawinan: props.familyData?.[0]?.status_perkawinan || '',
  nama_ismi: props.familyData?.[0]?.nama_ismi || '',
  pekerjaan_ismi: props.familyData?.[0]?.pekerjaan_ismi || '',
})

const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)

const handleEdit = (item: any) => {
  form.value = {
    status_perkawinan: item.status_perkawinan,
    nama_ismi: item.nama_ismi,
    pekerjaan_ismi: item.pekerjaan_ismi,
  }
  isEditing.value = true
}

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
    <KepegawaianDocumentPreview 
      :show="preview.show" 
      :title="preview.title" 
      :file-url="preview.url" 
      @close="preview.show = false" 
    />
    <div class="section-header">
      <h3>Riwayat Keluarga</h3>
      <button @click="isEditing = !isEditing" class="btn-edit">
        {{ isEditing ? 'Batal' : 'Edit Keluarga' }}
      </button>
    </div>

    <table class="premium-table">
      <thead>
        <tr>
          <th>Status Perkawinan</th>
          <th>Nama Pasangan</th>
          <th>Pekerjaan Pasangan</th>
          <th class="text-center">KK</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in familyData" :key="item.id_keluarga">
          <td class="name-highlight">{{ item.status_perkawinan }}</td>
          <td>{{ item.nama_ismi || '-' }}</td>
          <td>{{ item.pekerjaan_ismi || '-' }}</td>
          <td class="text-center">
            <button v-if="item.upload_kk" @click="openPreview(`/assets/kk/${item.upload_kk}`, 'Kartu Keluarga')" class="btn-icon-view">📄</button>
            <span v-else class="text-muted">-</span>
          </td>
          <td class="table-actions">
            <button @click="handleEdit(item)" class="btn-edit-icon" title="Edit">✏️</button>
          </td>
        </tr>
        <tr v-if="!familyData || familyData.length === 0">
          <td colspan="5" class="text-center text-muted">Tidak ada riwayat keluarga.</td>
        </tr>
      </tbody>
    </table>

    <!-- MODAL FORM -->
    <div v-if="isEditing" class="modal-overlay">
      <div class="glass-card modal-box">
        <div class="modal-header">
          <h4>Edit Data Keluarga</h4>
          <button @click="isEditing = false" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="handleUpdate" class="premium-form">
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

.premium-table { width: 100%; border-collapse: separate; border-spacing: 0 0.5rem; }
.premium-table th { text-align: left; padding: 1rem; color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.premium-table td { padding: 1.25rem 1rem; background: white; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
.premium-table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
.premium-table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 12px; border-bottom-right-radius: 12px; }

.name-highlight { font-weight: 800; color: #1e293b; }
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
