<script setup lang="ts">
const props = defineProps<{
  nik: string
  pangkatData: any[]
}>()

const emit = defineEmits(['refresh'])
const { showAlert, askConfirm } = useAlert()

const preview = ref({ show: false, url: '', title: '' })
const openPreview = (url: string, title: string) => {
  preview.value = { show: true, url, title }
}

const isFormOpen = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ pangkat: '', no_sk: '', tmt: '' })
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)

// Fetch Reference
const { data: refData } = await useFetch<any>('/api/kepegawaian/master/pangkat')
const listPangkat = computed(() => refData.value?.data || [])

const handleEdit = (item: any) => {
  editingId.value = item.id
  form.value = {
    pangkat: item.pangkat,
    no_sk: item.no_sk,
    tmt: item.tmt
  }
  isFormOpen.value = true
}

const resetForm = () => {
  isFormOpen.value = false
  editingId.value = null
  form.value = { pangkat: '', no_sk: '', tmt: '' }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('pangkat', form.value.pangkat)
    formData.append('no_sk', form.value.no_sk)
    formData.append('tmt', form.value.tmt)
    if (fileInput.value?.files?.[0]) formData.append('upload_sk', fileInput.value.files[0])

    const url = editingId.value 
        ? `/api/kepegawaian/riwayat/pangkat/${editingId.value}`
        : `/api/kepegawaian/riwayat/pangkat/${props.nik}`
    
    const method = editingId.value ? 'PUT' : 'POST'

    const res = await $fetch<any>(url, { method, body: formData })
    if (res.success) {
      showAlert(`Riwayat Pangkat berhasil ${editingId.value ? 'diperbarui' : 'ditambahkan'}`, 'success')
      resetForm()
      emit('refresh')
    }
  } catch (e) { showAlert('Gagal memproses data', 'error') }
  finally { loading.value = false }
}

const handleDelete = (id: number) => {
  askConfirm(
    'Hapus Riwayat',
    'Yakin ingin menghapus riwayat pangkat ini?',
    async () => {
      try {
        const res = await $fetch<any>(`/api/kepegawaian/riwayat/pangkat/${id}`, { method: 'DELETE' })
        if (res.success) {
          showAlert('Data berhasil dihapus', 'info')
          emit('refresh')
        }
      } catch (e) { showAlert('Gagal menghapus data', 'error') }
    }
  )
}
</script>

<template>
  <div class="pangkat-section">
    <KepegawaianDocumentPreview 
      :show="preview.show" 
      :title="preview.title" 
      :file-url="preview.url" 
      @close="preview.show = false" 
    />

    <div class="section-header">
      <h4>Riwayat Pangkat & Golongan</h4>
      <button @click="isFormOpen ? resetForm() : (isFormOpen = true)" class="btn-add">
        {{ isFormOpen ? 'Batal' : '+ Tambah Pangkat' }}
      </button>
    </div>

    <div v-if="isFormOpen" class="form-card mb-6">
      <form @submit.prevent="handleSubmit" class="premium-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Pilih Pangkat / Golongan</label>
            <select v-model="form.pangkat" class="glass-input" required>
              <option value="">-- Pilih Pangkat --</option>
              <option v-for="p in listPangkat" :key="p.id" :value="p.pangkat + ' (' + p.golongan + ')'">
                {{ p.pangkat }} ({{ p.golongan }})
              </option>
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
            <label>Upload SK Pangkat (Optional)</label>
            <input type="file" ref="fileInput" class="glass-input" accept=".jpg,.jpeg,.png,.pdf" />
          </div>
        </div>
        <div class="form-footer">
          <button type="submit" :disabled="loading" class="btn-primary-lux">
            <span v-if="!loading">{{ editingId ? 'Perbarui Pangkat' : 'Simpan Pangkat' }}</span>
            <div v-else class="spinner-small"></div>
          </button>
        </div>
      </form>
    </div>

    <table class="premium-table">
      <thead>
        <tr>
          <th>Pangkat / Golongan</th>
          <th>Nomor SK</th>
          <th>TMT</th>
          <th class="text-center">SK</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in pangkatData" :key="p.id">
          <td class="name-highlight">{{ p.pangkat }}</td>
          <td>{{ p.no_sk }}</td>
          <td>{{ p.tmt }}</td>
          <td class="text-center">
            <button v-if="p.upload_sk" @click="openPreview(`/assets/pangkat/${p.upload_sk}`, `SK Pangkat - ${p.pangkat}`)" class="btn-icon-view">📄</button>
            <span v-else class="text-muted">-</span>
          </td>
          <td class="table-actions">
            <button @click="handleEdit(p)" class="btn-edit-icon" title="Edit">✏️</button>
            <button @click="handleDelete(p.id)" class="btn-del-icon" title="Hapus">&times;</button>
          </td>
        </tr>
        <tr v-if="pangkatData.length === 0">
          <td colspan="5" class="text-center text-muted">Belum ada riwayat pangkat tercatat</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.pangkat-section { padding: 0.5rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.section-header h4 { font-size: 1.2rem; font-weight: 800; color: #1e293b; }

.btn-add { background: #6366f1; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; }
.btn-add:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }

.form-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); padding: 2rem; border-radius: 20px; animation: slideDown 0.3s ease-out; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.form-group label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; }
.glass-input { background: rgba(255,255,255,0.8); border: 1px solid #e2e8f0; color: #1e293b; padding: 0.8rem 1rem; border-radius: 10px; width: 100%; outline: none; transition: 0.2s; }
.glass-input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

.form-footer { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
.btn-primary-lux { background: #6366f1; color: white; border: none; padding: 0.8rem 2rem; border-radius: 12px; font-weight: 700; cursor: pointer; }

.premium-table { width: 100%; border-collapse: separate; border-spacing: 0 0.5rem; }
.premium-table th { text-align: left; padding: 1rem; color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.premium-table td { padding: 1.25rem 1rem; background: white; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
.premium-table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
.premium-table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 12px; border-bottom-right-radius: 12px; }

.name-highlight { font-weight: 800; color: #1e293b; }
.btn-icon-view { background: none; border: none; font-size: 1.2rem; cursor: pointer; filter: grayscale(1); transition: 0.2s; }
.btn-icon-view:hover { filter: grayscale(0); transform: scale(1.1); }
.table-actions { display: flex; gap: 0.75rem; }
.btn-edit-icon, .btn-del-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; }
.btn-del-icon { color: #ef4444; font-size: 1.4rem; }

@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>
