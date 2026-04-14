<template>
  <div class="certification-section">
    <div class="section-header">
      <div class="header-text">
        <h3>Riwayat Sertifikasi Dosen</h3>
        <p>Kelola sertifikat pendidik (Serdos) dan sertifikasi profesi lainnya</p>
      </div>
      <button @click="openModal()" class="btn-add">
        <span>+</span> Tambah Sertifikasi
      </button>
    </div>

    <div class="table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Jenis Sertifikasi</th>
            <th>Bidang Studi</th>
            <th>No. SK / Reg</th>
            <th>Tahun</th>
            <th>File</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in certs" :key="item.id">
            <td><span class="badge-type">{{ item.jenis_sertifikasi }}</span></td>
            <td class="font-bold">{{ item.bidang_studi }}</td>
            <td>
              <div class="no-info">
                <span>SK: {{ item.no_sk || '-' }}</span>
                <span class="sub">Reg: {{ item.no_reg_sertifikasi || '-' }}</span>
              </div>
            </td>
            <td><span class="year-tag">{{ item.tahun }}</span></td>
            <td>
              <button v-if="item.upload_sk_sertifikasi" @click="viewFile(item)" class="btn-file">
                📄 Lihat SK
              </button>
              <span v-else class="no-file">Tidak ada file</span>
            </td>
          <td class="table-actions">
            <button @click="openModal(item)" class="btn-edit-icon" title="Edit">✏️</button>
            <button @click="handleDelete(item.id)" class="btn-del-icon" title="Hapus">&times;</button>
          </td>
          </tr>
          <tr v-if="certs.length === 0">
            <td colspan="6" class="empty-state">Belum ada riwayat sertifikasi untuk dosen ini.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h4>{{ form.id ? 'Edit' : 'Tambah' }} Sertifikasi</h4>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="saveData" class="premium-form">
          <div class="form-grid">
            <div class="form-group full">
              <label>Jenis Sertifikasi</label>
              <input v-model="form.jenis_sertifikasi" type="text" placeholder="Contoh: Sertifikat Pendidik (Serdos)" required />
            </div>

            <div class="form-group">
              <label>Bidang Studi</label>
              <input v-model="form.bidang_studi" type="text" placeholder="Contoh: Teknik Informatika" required />
            </div>

            <div class="form-group">
              <label>No. Registrasi</label>
              <input v-model="form.no_reg_sertifikasi" type="text" placeholder="No. Reg / No. Sertifikat" />
            </div>

            <div class="form-group">
              <label>No. SK</label>
              <input v-model="form.no_sk" type="text" placeholder="Nomor SK Sertifikasi" />
            </div>

            <div class="form-group">
              <label>Tahun</label>
              <input v-model="form.tahun" type="number" min="1950" max="2100" placeholder="Tahun" required />
            </div>

            <div class="form-group">
              <label>Lampiran SK (Nama File)</label>
              <input v-model="form.upload_sk_sertifikasi" type="text" placeholder="Contoh: sk_serdos.pdf" />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save" :disabled="loading">
              {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <KepegawaianDocumentPreview 
      :show="preview.show" 
      :title="preview.title" 
      :file-url="preview.url" 
      @close="preview.show = false" 
    />
  </div>
</template>

<script setup>
const props = defineProps({
  nik: { type: String, required: true }
})
const emit = defineEmits(['refresh'])

const certs = ref([])
const showModal = ref(false)
const loading = ref(false)
const preview = ref({ show: false, title: '', url: '' })

const form = ref({
  id: null,
  nik: props.nik,
  jenis_sertifikasi: '',
  bidang_studi: '',
  no_reg_sertifikasi: '',
  no_sk: '',
  tahun: '',
  upload_sk_sertifikasi: ''
})

const fetchCerts = async () => {
  const data = await $fetch(`/api/kepegawaian/sertifikasi?nik=${props.nik}`)
  if (data.success) certs.value = data.data
}

onMounted(fetchCerts)

const openModal = (item = null) => {
  if (item) {
    form.value = { ...item }
  } else {
    form.value = {
      id: null,
      nik: props.nik,
      jenis_sertifikasi: 'Sertifikat Pendidik',
      bidang_studi: '',
      no_reg_sertifikasi: '',
      no_sk: '',
      tahun: new Date().getFullYear().toString(),
      upload_sk_sertifikasi: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const viewFile = (item) => {
  preview.value = {
    show: true,
    title: `SK ${item.jenis_sertifikasi} - ${item.bidang_studi}`,
    url: `/assets/jafung/${item.upload_sk_sertifikasi}`
  }
}

const saveData = async () => {
  loading.value = true
  try {
    const res = await $fetch('/api/kepegawaian/sertifikasi', {
      method: 'POST',
      body: form.value
    })
    if (res.success) {
      fetchCerts()
      closeModal()
      emit('refresh')
    }
  } catch (e) {
    alert('Gagal menyimpan: ' + e.message)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('Hapus data sertifikasi ini?')) return
  try {
    const res = await $fetch(`/api/kepegawaian/sertifikasi/${id}`, { method: 'DELETE' })
    if (res.success) {
      fetchCerts()
      emit('refresh')
    }
  } catch (e) {
    alert('Gagal menghapus: ' + e.message)
  }
}
</script>

<style scoped>
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; }
.header-text h3 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin: 0; }
.header-text p { font-size: 0.85rem; color: #64748b; margin: 0.25rem 0 0; }

.btn-add { background: var(--primary); color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 0.5rem; }
.btn-add:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }

.premium-table { width: 100%; border-collapse: separate; border-spacing: 0 0.5rem; }
.premium-table th { text-align: left; padding: 1rem; color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.premium-table td { padding: 1.25rem 1rem; background: white; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
.premium-table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
.premium-table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 12px; border-bottom-right-radius: 12px; }

.badge-type { background: #e0e7ff; color: #4338ca; padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; }
.year-tag { background: #f1f5f9; color: #475569; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 800; font-size: 0.8rem; }
.btn-file { background: none; border: none; color: var(--primary); font-weight: 800; font-size: 0.85rem; cursor: pointer; padding: 0; }
.btn-file:hover { text-decoration: underline; }
.no-file { color: #cbd5e1; font-size: 0.8rem; }

.no-info { display: flex; flex-direction: column; gap: 0.1rem; }
.no-info span { font-weight: 700; color: #1e293b; font-size: 0.85rem; }
.no-info .sub { font-size: 0.7rem; color: #94a3b8; font-weight: 400; }

.table-actions { display: flex; gap: 0.75rem; }
.btn-edit-icon, .btn-del-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; }
.btn-del-icon { color: #ef4444; font-size: 1.4rem; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-content { width: 100%; max-width: 700px; padding: 2.5rem; border-radius: 20px; animation: zoomIn 0.3s ease-out; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.modal-header h4 { font-size: 1.25rem; font-weight: 900; color: #1e293b; margin: 0; }
.btn-close { background: none; border: none; font-size: 2rem; color: #94a3b8; cursor: pointer; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.form-group.full { grid-column: span 2; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
.form-group input { padding: 0.8rem 1rem; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; }
.form-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }

.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
.btn-cancel { padding: 0.8rem 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-weight: 700; color: #64748b; }
.btn-save { padding: 0.8rem 2rem; border-radius: 12px; background: var(--primary); color: white; border: none; cursor: pointer; font-weight: 700; transition: 0.3s; }
.btn-save:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }

@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
