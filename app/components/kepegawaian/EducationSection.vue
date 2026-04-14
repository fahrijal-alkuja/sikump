<script setup lang="ts">
import { ref } from 'vue'
const { showAlert, askConfirm } = useAlert()

const props = defineProps<{
  nik: string
  educationData: any[]
}>()

const emit = defineEmits(['refresh'])

const getJenjangName = (id: number) => {
  const map: Record<number, string> = {
    1: 'SD', 2: 'SMP', 3: 'SMA', 4: 'S1', 5: 'S2', 6: 'S3', 
    11: 'D1', 12: 'D2', 13: 'D3', 14: 'D4', 21: 'Profesi'
  }
  return map[id] || 'Lainnya'
}

const isFormOpen = ref(false)
const editingId = ref<number | null>(null)
const form = ref({
  id_pendidikan: 4,
  asal_pendidikan: '',
  tahun_lulus: '',
})
const fileInput = ref<HTMLInputElement | null>(null)

const loading = ref(false)

const handleEdit = (edu: any) => {
    editingId.value = edu.id
    form.value = {
        id_pendidikan: edu.id_pendidikan || 4,
        asal_pendidikan: edu.asal_pendidikan || '',
        tahun_lulus: edu.tahun_lulus || ''
    }
    isFormOpen.value = true
}

const resetForm = () => {
    isFormOpen.value = false
    editingId.value = null
    form.value = { id_pendidikan: 4, asal_pendidikan: '', tahun_lulus: '' }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('nik', props.nik)
    formData.append('id_pendidikan', form.value.id_pendidikan.toString())
    formData.append('asal_pendidikan', form.value.asal_pendidikan)
    formData.append('tahun_lulus', form.value.tahun_lulus)
    
    if (fileInput.value?.files?.[0]) {
      formData.append('upload_ijazah', fileInput.value.files[0])
    }

    const url = editingId.value 
        ? `/api/kepegawaian/riwayat/riwayat_pendidikan/${editingId.value}`
        : `/api/kepegawaian/riwayat/riwayat_pendidikan`
    
    const method = editingId.value ? 'PUT' : 'POST'

    // @ts-ignore
    const response = await $fetch<any>(url, {
      method,
      body: formData
    })

    if (response.success) {
      showAlert(`Riwayat pendidikan berhasil ${editingId.value ? 'diperbarui' : 'ditambahkan'}`, 'success')
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
    'Hapus Pendidikan',
    'Yakin ingin menghapus riwayat pendidikan ini?',
    async () => {
      try {
        // @ts-ignore
        const response = await $fetch<any>(`/api/kepegawaian/riwayat/riwayat_pendidikan/${id}`, {
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

const preview = ref({ show: false, url: '', title: '' })
const openPreview = (url: string, title: string) => {
  preview.value = { show: true, url, title }
}
</script>

<template>
  <div class="education-section">
    <KepegawaianDocumentPreview 
      :show="preview.show" 
      :title="preview.title" 
      :file-url="preview.url" 
      @close="preview.show = false" 
    />
    <div class="section-header">
      <h3>Riwayat Pendidikan</h3>
      <button @click="isFormOpen ? resetForm() : (isFormOpen = true)" class="btn-edit">
        {{ isFormOpen ? 'Batal' : '+ Tambah Pendidikan' }}
      </button>
    </div>

    <div v-if="isFormOpen" class="form-container glass-card mb-6">
      <form @submit.prevent="handleSubmit" class="premium-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Jenjang</label>
            <select v-model="form.id_pendidikan" class="glass-input">
              <option :value="4">S1 - Sarjana</option>
              <option :value="5">S2 - Magister</option>
              <option :value="6">S3 - Doktor</option>
              <option :value="3">D3 - Diploma</option>
              <option :value="1">SMA / Sederajat</option>
            </select>
          </div>
          <div class="form-group">
            <label>Asal Pendidikan</label>
            <input v-model="form.asal_pendidikan" type="text" class="glass-input" placeholder="Nama Universitas / Sekolah" required />
          </div>
          <div class="form-group">
            <label>Tahun Lulus</label>
            <input v-model="form.tahun_lulus" type="text" class="glass-input" placeholder="Contoh: 2020" required />
          </div>
          <div class="form-group">
            <label>Upload Ijazah (PDF/JPG)</label>
            <input type="file" ref="fileInput" class="glass-input" accept=".jpg,.jpeg,.png,.pdf" />
          </div>
        </div>
        <div class="form-footer">
          <button type="submit" :disabled="loading" class="btn-primary-lux">
            <span v-if="!loading">{{ editingId ? 'Perbarui Pendidikan' : 'Simpan Pendidikan' }}</span>
            <div v-else class="spinner-small"></div>
          </button>
        </div>
      </form>
    </div>

    <table class="premium-table">
      <thead>
        <tr>
          <th>Jenjang</th>
          <th>Asal Pendidikan</th>
          <th>Tahun Lulus</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="edu in educationData" :key="edu.id">
          <td>{{ getJenjangName(edu.id_pendidikan) }}</td>
          <td>{{ edu.asal_pendidikan }}</td>
          <td>{{ edu.tahun_lulus }}</td>
          <td class="table-actions">
            <button 
              v-if="edu.upload_ijazah" 
              @click="openPreview(`/assets/pendidikan/${edu.upload_ijazah}`, `Ijazah ${edu.asal_pendidikan}`)" 
              class="btn-view"
              title="Lihat Ijazah"
            >
              📄
            </button>
            <button @click="handleEdit(edu)" class="btn-edit-icon" title="Edit">✏️</button>
            <button @click="handleDelete(edu.id)" class="btn-del-icon" title="Hapus">&times;</button>
          </td>
        </tr>
        <tr v-if="educationData.length === 0">
          <td colspan="4" class="text-center text-muted">Belum ada riwayat pendidikan</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-edit { background: var(--primary); border: none; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
.form-container { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 16px; margin-bottom: 2.5rem; animation: slideDown 0.3s ease-out; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
.form-group label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.glass-input { background: rgba(255,255,255,0.8); border: 1px solid var(--glass-border); color: #1e293b; padding: 1rem; border-radius: 10px; width: 100%; outline: none; transition: all 0.2s; }
.form-footer { margin-top: 2rem; display: flex; justify-content: flex-end; }
.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { text-align: left; padding: 1rem; border-bottom: 1px solid var(--glass-border); font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
.premium-table td { padding: 1rem; border-bottom: 1px solid var(--glass-border); font-size: 0.9rem; }
.table-actions { display: flex; gap: 1rem; align-items: center; }
.btn-view { background: none; border: none; font-size: 1.2rem; cursor: pointer; filter: grayscale(1); }
.btn-view:hover { filter: grayscale(0); transform: scale(1.1); }
.btn-edit-icon { background: none; border: none; font-size: 1.1rem; cursor: pointer; }
.btn-del-icon { background: none; border: none; color: #ef4444; font-size: 1.5rem; cursor: pointer; line-height: 1; opacity: 0.7; }
.btn-del-icon:hover { opacity: 1; }
.mb-6 { margin-bottom: 1.5rem; }
</style>
