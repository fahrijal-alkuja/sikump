<script setup lang="ts">
import { ref, computed } from 'vue'
const { showAlert, askConfirm } = useAlert()

const props = defineProps<{
  nik: string
  jafungData: any[]
}>()

const emit = defineEmits(['refresh'])

// --- REFERENCE DATA ---
const { data: refJafung } = await useFetch<any>('/api/kepegawaian/riwayat/jafung/levels')
const jafungLevels = computed(() => refJafung.value?.data || [
  { id: '1', nama: 'Asisten Ahli' },
  { id: '2', nama: 'Lektor' },
  { id: '3', nama: 'Lektor Kepala' },
  { id: '4', nama: 'Guru Besar' }
])

const getJafungName = (id: any) => {
  const found = jafungLevels.value.find((l: any) => String(l.id) === String(id))
  return found ? found.nama : 'Jabatan Akademik'
}

// --- STATE ---
const isFormOpen = ref(false)
const editingId = ref<number | null>(null)
const loading = ref(false)

const form = ref({
  id_jafung: '1',
  no_sk: '',
  tmt: '',
})
const fileInput = ref<HTMLInputElement | null>(null)

// --- ACTIONS ---
const handleEdit = (item: any) => {
  editingId.value = item.id
  form.value = {
    id_jafung: String(item.id_jafung || '1'),
    no_sk: item.no_sk || '',
    tmt: item.tmt || '',
  }
  isFormOpen.value = true
}

const resetForm = () => {
  isFormOpen.value = false
  editingId.value = null
  form.value = { id_jafung: '1', no_sk: '', tmt: '' }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('nik', props.nik)
    formData.append('id_jafung', form.value.id_jafung)
    formData.append('no_sk', form.value.no_sk)
    formData.append('tmt', form.value.tmt)
    
    if (fileInput.value?.files?.[0]) {
      formData.append('file_upload', fileInput.value.files[0])
    }

    const url = editingId.value 
        ? `/api/kepegawaian/riwayat/riwayat_jafung/${editingId.value}`
        : `/api/kepegawaian/riwayat/riwayat_jafung`
    
    const method = editingId.value ? 'PUT' : 'POST'

    const res = await $fetch<any>(url, { method, body: formData })

    if (res.success) {
      showAlert(`Jabatan Akademik berhasil ${editingId.value ? 'diperbarui' : 'ditambahkan'}`, 'success')
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
    'Hapus Data',
    'Ingin menghapus riwayat jabatan akademik ini?',
    async () => {
      try {
        const res = await $fetch<any>(`/api/kepegawaian/riwayat/riwayat_jafung/${id}`, { method: 'DELETE' })
        if (res.success) {
          showAlert('Data dihapus', 'info')
          emit('refresh')
        }
      } catch (e) {
        showAlert('Gagal menghapus data', 'error')
      }
    }
  )
}

const preview = ref({ show: false, url: '', title: '' })
const openPreview = (url: string, title: string) => {
  preview.value = { show: true, url, title }
}
</script>

<template>
  <div class="jafung-section">
    <KepegawaianDocumentPreview 
      :show="preview.show" 
      :title="preview.title" 
      :file-url="preview.url" 
      @close="preview.show = false" 
    />

    <div class="section-header">
      <h3>Riwayat Jabatan Akademik (JAFUNG)</h3>
      <button @click="isFormOpen = true" class="btn-add-premium">
        <span class="plus">+</span> Tambah Jafung
      </button>
    </div>

    <table class="premium-table">
      <thead>
        <tr>
          <th>Jabatan Akademik</th>
          <th>Nomor SK</th>
          <th>TMT</th>
          <th class="text-center">SK</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in jafungData" :key="item.id">
          <td class="name-highlight">{{ getJafungName(item.id_jafung) }}</td>
          <td>{{ item.no_sk }}</td>
          <td>{{ item.tmt }}</td>
          <td class="text-center">
            <button v-if="item.file_upload" @click="openPreview(`/assets/SK/${item.file_upload}`, `SK Jafung - ${getJafungName(item.id_jafung)}`)" class="btn-icon-view">📄</button>
            <span v-else class="text-muted">-</span>
          </td>
          <td class="table-actions">
            <button @click="handleEdit(item)" class="btn-edit-icon" title="Edit">✏️</button>
            <button @click="handleDelete(item.id)" class="btn-del-icon" title="Hapus">&times;</button>
          </td>
        </tr>
        <tr v-if="!jafungData || jafungData.length === 0">
          <td colspan="5" class="text-center text-muted">Belum ada riwayat jabatan akademik.</td>
        </tr>
      </tbody>
    </table>

    <!-- MODAL FORM -->
    <div v-if="isFormOpen" class="modal-overlay">
      <div class="glass-card modal-box">
        <div class="modal-header">
          <h4>{{ editingId ? 'Edit' : 'Tambah' }} Jabatan Akademik</h4>
          <button @click="resetForm" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="handleSubmit" class="premium-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Pilih Jabatan</label>
              <select v-model="form.id_jafung" class="glass-input">
                <option v-for="l in jafungLevels" :key="l.id" :value="l.id">{{ l.nama }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nomor SK</label>
              <input v-model="form.no_sk" type="text" class="glass-input" required />
            </div>
            <div class="form-group">
              <label>TMT (Tanggal Mulai Tugas)</label>
              <input v-model="form.tmt" type="date" class="glass-input" required />
            </div>
            <div class="form-group">
              <label>Upload SK (PDF/JPG)</label>
              <input type="file" ref="fileInput" class="glass-input" accept=".jpg,.jpeg,.png,.pdf" />
            </div>
          </div>
          <div class="form-footer">
            <button type="submit" :disabled="loading" class="btn-primary-lux">
              <span v-if="!loading">{{ editingId ? 'Perbarui' : 'Simpan' }} Jafung</span>
              <div v-else class="spinner-small"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.section-header h3 { font-size: 1.25rem; font-weight: 900; color: #1e293b; position: relative; padding-left: 1rem; }
.section-header h3::before { content: ''; position: absolute; left: 0; top: 0.25rem; bottom: 0.25rem; width: 4px; background: #6366f1; border-radius: 2px; }

.btn-add-premium { background: #6366f1; border: none; color: white; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
.btn-add-premium:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(99, 102, 241, 0.3); }

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
.btn-del-icon { background: none; border: none; color: #ef4444; font-size: 1.4rem; cursor: pointer; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-box { width: 100%; max-width: 700px; padding: 2.5rem; animation: zoomIn 0.3s ease-out; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.modal-header h4 { font-size: 1.25rem; font-weight: 900; color: #1e293b; }
.btn-close { background: none; border: none; font-size: 2rem; color: #94a3b8; cursor: pointer; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
.glass-input { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; border-radius: 10px; outline: none; transition: all 0.2s; }
.glass-input:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

.form-footer { margin-top: 2rem; display: flex; justify-content: flex-end; }
.btn-primary-lux { background: #6366f1; border: none; color: white; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; }
.btn-primary-lux:hover { background: #4f46e5; }

.spinner-small { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
