<template>
  <div class="certification-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Master Sertifikasi Dosen (Serdos)</h1>
        <p>Kelola data sertifikat pendidik dan profesi dosen Unikarta</p>
      </div>
      <button @click="openModal()" class="btn-add">
        <span class="icon">+</span> Tambah Sertifikasi
      </button>
    </div>

    <div class="glass-card table-container">
      <div class="table-filters">
        <input v-model="search" type="text" placeholder="Cari Nama Dosen atau NIK..." class="search-input" />
      </div>

      <table class="premium-table">
        <thead>
          <tr>
            <th>Dosen</th>
            <th>Jenis Sertifikasi</th>
            <th>Bidang Studi</th>
            <th>No. SK / Reg</th>
            <th>Tahun</th>
            <th>File</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredData" :key="item.id">
            <td>
              <div class="dosen-info">
                <span class="d-name">{{ getDosenName(item.nik) }}</span>
                <span class="d-nik">{{ item.nik }}</span>
              </div>
            </td>
            <td><span class="badge-type">{{ item.jenis_sertifikasi }}</span></td>
            <td>{{ item.bidang_studi }}</td>
            <td>
              <div class="no-info">
                <span>SK: {{ item.no_sk }}</span>
                <span class="sub">Reg: {{ item.no_reg_sertifikasi }}</span>
              </div>
            </td>
            <td><span class="year-tag">{{ item.tahun }}</span></td>
            <td>
              <button v-if="item.upload_sk_sertifikasi" @click="viewFile(item)" class="btn-file">
                📄 Lihat SK
              </button>
              <span v-else class="no-file">-</span>
            </td>
            <td>
              <div class="actions">
                <button @click="openModal(item)" class="btn-edit" title="Edit">✏️</button>
                <button @click="deleteItem(item.id)" class="btn-delete" title="Hapus">🗑️</button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredData.length === 0">
            <td colspan="7" class="empty-state">Data tidak ditemukan atau belum ada data sertifikasi.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h2>{{ form.id ? 'Edit' : 'Tambah' }} Sertifikasi</h2>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="saveData" class="premium-form">
          <div class="form-grid">
            <div class="form-group full">
              <label>Pilih Dosen</label>
              <select v-model="form.nik" required :disabled="form.id">
                <option value="">-- Pilih Dosen --</option>
                <option v-for="d in dosenList" :key="d.nik" :value="d.nik">
                  {{ d.nama_dosen }} ({{ d.nik }})
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Jenis Sertifikasi</label>
              <input v-model="form.jenis_sertifikasi" type="text" placeholder="Contoh: Sertifikat Pendidik" required />
            </div>

            <div class="form-group">
              <label>Bidang Studi</label>
              <input v-model="form.bidang_studi" type="text" placeholder="Bidang yang disertifikasi" required />
            </div>

            <div class="form-group">
              <label>No. Registrasi</label>
              <input v-model="form.no_reg_sertifikasi" type="text" placeholder="Masukkan Nomor Registrasi" />
            </div>

            <div class="form-group">
              <label>No. SK Sertifikasi</label>
              <input v-model="form.no_sk" type="text" placeholder="Masukkan Nomor SK" />
            </div>

            <div class="form-group">
              <label>Tahun Sertifikasi</label>
              <input v-model="form.tahun" type="text" placeholder="Contoh: 2023" required />
            </div>

            <div class="form-group">
              <label>File SK (Opsional)</label>
              <input type="text" v-model="form.upload_sk_sertifikasi" placeholder="Nama file SK" />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save" :disabled="loading">
              {{ loading ? 'Menyimpan...' : 'Simpan Data' }}
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
const search = ref('')
const showModal = ref(false)
const loading = ref(false)
const preview = ref({ show: false, title: '', url: '' })
const certData = ref([])
const dosenList = ref([])

const form = ref({
  id: null,
  nik: '',
  jenis_sertifikasi: '',
  bidang_studi: '',
  no_reg_sertifikasi: '',
  no_sk: '',
  tahun: '',
  upload_sk_sertifikasi: ''
})

const fetchData = async () => {
  const { data } = await useFetch('/api/kepegawaian/sertifikasi')
  if (data.value?.success) certData.value = data.value.data
  
  const { data: dData } = await useFetch('/api/kepegawaian/index?category=1&limit=500')
  if (dData.value?.success) dosenList.value = dData.value.data
}

onMounted(fetchData)

const getDosenName = (nik) => {
  const d = dosenList.value.find(x => x.nik === nik)
  return d ? d.nama : nik
}

const viewFile = (item) => {
  preview.value = {
    show: true,
    title: `SK ${item.jenis_sertifikasi} - ${getDosenName(item.nik)}`,
    url: `/assets/jafung/${item.upload_sk_sertifikasi}`
  }
}

const filteredData = computed(() => {
  if (!search.value) return certData.value
  const s = search.value.toLowerCase()
  return certData.value.filter(x => 
    x.nik.toLowerCase().includes(s) || 
    x.jenis_sertifikasi?.toLowerCase().includes(s) ||
    x.bidang_studi?.toLowerCase().includes(s)
  )
})

const openModal = (item = null) => {
  if (item) {
    form.value = { ...item }
  } else {
    form.value = {
      id: null,
      nik: '',
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

const saveData = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/kepegawaian/sertifikasi', {
      method: 'POST',
      body: form.value
    })
    if (data.success) {
      alert('Berhasil menyimpan data!')
      fetchData()
      closeModal()
    }
  } catch (e) {
    alert('Gagal menyimpan: ' + e.message)
  } finally {
    loading.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('Anda yakin ingin menghapus data ini?')) return
  try {
    const { data } = await $fetch(`/api/kepegawaian/sertifikasi/${id}`, { method: 'DELETE' })
    if (data.success) {
      fetchData()
    }
  } catch (e) {
    alert('Gagal menghapus: ' + e.message)
  }
}
</script>

<style scoped>
.certification-page { padding: 2rem; max-width: 1400px; margin: 0 auto; color: #1e293b; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-content h1 { font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.header-content p { color: #64748b; font-size: 0.95rem; }

.btn-add { background: var(--primary); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 0.5rem; }
.btn-add:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4); }

.glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 24px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); }
.table-container { overflow: hidden; }

.table-filters { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; }
.search-input { width: 100%; max-width: 400px; padding: 0.8rem 1.2rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; transition: all 0.3s ease; }
.search-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { text-align: left; padding: 1.2rem; background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; }
.premium-table td { padding: 1.2rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }

.dosen-info { display: flex; flex-direction: column; }
.d-name { font-weight: 800; color: #1e293b; }
.d-nik { font-family: monospace; font-size: 0.8rem; color: #64748b; }

.badge-type { background: #e0e7ff; color: #4338ca; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 700; font-size: 0.8rem; }
.year-tag { background: #f1f5f9; color: #475569; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 700; }

.no-info { display: flex; flex-direction: column; }
.no-info .sub { font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem; }

.btn-file { background: none; border: none; color: var(--primary); font-weight: 700; font-size: 0.85rem; cursor: pointer; padding: 0; }
.btn-file:hover { text-decoration: underline; }
.no-file { color: #cbd5e1; }

.actions { display: flex; gap: 0.5rem; }
.btn-edit, .btn-delete { background: white; border: 1px solid #e2e8f0; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-edit:hover { background: #f0fdf4; border-color: #22c55e; }
.btn-delete:hover { background: #fef2f2; border-color: #ef4444; }

.empty-state { text-align: center; padding: 4rem; color: #94a3b8; font-style: italic; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-content { width: 100%; max-width: 700px; padding: 2rem; position: relative; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.modal-header h2 { font-size: 1.5rem; font-weight: 800; color: #1e293b; }
.btn-close { background: none; border: none; font-size: 2rem; color: #94a3b8; cursor: pointer; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.form-group.full { grid-column: span 2; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.85rem; font-weight: 700; color: #475569; }
.form-group input, .form-group select { padding: 0.8rem 1rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: var(--primary); }

.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
.btn-cancel { padding: 0.8rem 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; font-weight: 600; }
.btn-save { padding: 0.8rem 2rem; border-radius: 12px; background: var(--primary); color: white; border: none; cursor: pointer; font-weight: 700; }
</style>
