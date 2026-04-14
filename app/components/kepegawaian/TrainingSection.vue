<script setup lang="ts">
import { ref } from 'vue'
const { showAlert, askConfirm } = useAlert()

const props = defineProps<{
  nik: string
  trainingData: any[]
}>()

const emit = defineEmits(['refresh'])

const preview = ref({ show: false, url: '', title: '' })
const openPreview = (url: string, title: string) => {
  preview.value = { show: true, url, title }
}

const isFormOpen = ref(false)
const editingId = ref<number | null>(null)
const form = ref({
  nama_diklat: '',
  no_sertifikat: '',
  tahun: '',
  tempat: '',
})

const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const handleEdit = (t: any) => {
    editingId.value = t.id
    form.value = {
        nama_diklat: t.nama_diklat || '',
        no_sertifikat: t.no_sertifikat || '',
        tahun: t.tahun || '',
        tempat: t.tempat || ''
    }
    isFormOpen.value = true
}

const resetForm = () => {
    isFormOpen.value = false
    editingId.value = null
    form.value = { nama_diklat: '', no_sertifikat: '', tahun: '', tempat: '' }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('nik', props.nik)
    formData.append('nama_diklat', form.value.nama_diklat)
    formData.append('no_sertifikat', form.value.no_sertifikat)
    formData.append('tahun', form.value.tahun)
    formData.append('tempat', form.value.tempat)
    
    if (fileInput.value?.files?.[0]) {
      formData.append('upload', fileInput.value.files[0])
    }

    const url = editingId.value 
        ? `/api/kepegawaian/riwayat/riwayat_pelatihan/${editingId.value}`
        : `/api/kepegawaian/riwayat/riwayat_pelatihan`
    
    const method = editingId.value ? 'PUT' : 'POST'

    // @ts-ignore
    const response = await $fetch<any>(url, {
      method,
      body: formData
    })

    if (response.success) {
      showAlert(`Riwayat pelatihan berhasil ${editingId.value ? 'diperbarui' : 'ditambahkan'}`, 'success')
      resetForm()
      emit('refresh')
    }
  } catch (e) {
    showAlert('Gagal memproses data', 'error')
  } finally {
    loading.value = false
  }
}

const handleDelete = (id: number) => {
  askConfirm(
    'Hapus Pelatihan',
    'Apakah Anda yakin ingin menghapus data pelatihan ini?',
    async () => {
      try {
        // @ts-ignore
        const response = await $fetch<any>(`/api/kepegawaian/riwayat/riwayat_pelatihan/${id}`, {
          method: 'DELETE'
        })
        if (response.success) {
          showAlert('Data dihapus', 'info')
          emit('refresh')
        }
      } catch (e) {
        showAlert('Gagal menghapus data', 'error')
      }
    }
  )
}
</script>

<template>
  <div class="training-section">
    <KepegawaianDocumentPreview 
      :show="preview.show" 
      :title="preview.title" 
      :file-url="preview.url" 
      @close="preview.show = false" 
    />
    <div class="section-header">
      <h3>Riwayat Pelatihan</h3>
      <button @click="isFormOpen ? resetForm() : (isFormOpen = true)" class="btn-edit">
        {{ isFormOpen ? 'Batal' : '+ Tambah Pelatihan' }}
      </button>
    </div>

    <div v-if="isFormOpen" class="form-container glass-card mb-6">
      <form @submit.prevent="handleSubmit" class="premium-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Nama Diklat/Pelatihan</label>
            <input v-model="form.nama_diklat" type="text" class="glass-input" required />
          </div>
          <div class="form-group">
            <label>No. Sertifikat</label>
            <input v-model="form.no_sertifikat" type="text" class="glass-input" />
          </div>
          <div class="form-group">
            <label>Tahun</label>
            <input v-model="form.tahun" type="text" class="glass-input" required />
          </div>
          <div class="form-group">
            <label>Tempat</label>
            <input v-model="form.tempat" type="text" class="glass-input" />
          </div>
          <div class="form-group">
            <label>Upload Sertifikat (Optional)</label>
            <input type="file" ref="fileInput" class="glass-input" accept=".jpg,.jpeg,.png,.pdf" />
          </div>
        </div>
        <div class="form-footer">
          <button type="submit" :disabled="loading" class="btn-primary-lux">
            <span v-if="!loading">{{ editingId ? 'Perbarui Pelatihan' : 'Simpan Pelatihan' }}</span>
            <div v-else class="spinner-small"></div>
          </button>
        </div>
      </form>
    </div>

    <table class="premium-table">
      <thead>
        <tr>
          <th>Nama Pelatihan</th>
          <th>Tahun</th>
          <th>Tempat</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in trainingData" :key="t.id">
          <td>{{ t.nama_diklat }}</td>
          <td>{{ t.tahun }}</td>
          <td>{{ t.tempat || '-' }}</td>
          <td class="table-actions">
            <button v-if="t.upload" @click="openPreview(`/assets/sertifikat/${t.upload}`, `Sertifikat - ${t.nama_diklat}`)" class="btn-view-btn" title="Lihat Sertifikat">📄</button>
            <button @click="handleEdit(t)" class="btn-edit-icon" title="Edit">✏️</button>
            <button @click="handleDelete(t.id)" class="btn-del-icon" title="Hapus">&times;</button>
          </td>
        </tr>
        <tr v-if="trainingData.length === 0">
          <td colspan="4" class="text-center text-muted">Belum ada riwayat pelatihan</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-edit { background: var(--primary); border: none; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
.form-container { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 16px; margin-bottom: 2.5rem; animation: slideDown 0.3s ease-out; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
.form-group label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.glass-input { background: rgba(255,255,255,0.8); border: 1px solid var(--glass-border); color: #1e293b; padding: 1rem; border-radius: 10px; width: 100%; outline: none; transition: all 0.2s; }
.form-footer { margin-top: 2rem; display: flex; justify-content: flex-end; }
.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { text-align: left; padding: 1rem; border-bottom: 1px solid var(--glass-border); font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
.premium-table td { padding: 1rem; border-bottom: 1px solid var(--glass-border); font-size: 0.9rem; }
.table-actions { display: flex; gap: 1rem; align-items: center; }
.btn-view-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; filter: grayscale(1); transition: 0.2s; }
.btn-view-btn:hover { filter: grayscale(0); transform: scale(1.1); }
.btn-edit-icon { background: none; border: none; font-size: 1.1rem; cursor: pointer; }
.btn-del-icon { background: none; border: none; color: #ef4444; font-size: 1.5rem; cursor: pointer; opacity: 0.7; }
.btn-del-icon:hover { opacity: 1; }
.mb-6 { margin-bottom: 1.5rem; }
</style>
