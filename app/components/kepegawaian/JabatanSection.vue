<script setup lang="ts">
const props = defineProps<{
  nik: string
  type: 'dosen' | 'tendik'
  jafungData: any[]
  jabatanData: any[]
}>()

const emit = defineEmits(['refresh'])
const { showAlert, askConfirm } = useAlert()

const getJafungName = (id: any) => {
  const map: any = { 1: 'Asisten Ahli', 2: 'Lektor', 3: 'Lektor Kepala', 4: 'Guru Besar' }
  return map[id] || 'Lainnya'
}

// Jafung State
const isFormJafungOpen = ref(false)
const editingJafungId = ref<number | null>(null)
const jafungForm = ref({ id_jafung: 1, no_sk: '', tmt: '' })
const jafungFile = ref<HTMLInputElement | null>(null)

// Jabatan State
const isFormJabatanOpen = ref(false)
const editingJabatanId = ref<number | null>(null)
const jabatanForm = ref({ id_jabatan: '', id_biro: '', no_sk: '', tmt: '', ikatan_kerja: '1', is_aktiv: 'Y', status: '', tanggal_keluar: '' })
const jabatanFile = ref<HTMLInputElement | null>(null)

// References
const { data: refJabatan } = await useFetch<any>('/api/kepegawaian/master/jabatan')
const { data: refBiro } = await useFetch<any>('/api/kepegawaian/biro')

const jabatanList = computed(() => refJabatan.value?.data || [])
const biroList = computed(() => refBiro.value?.data || [])

const getJabatanName = (id: any) => {
    const item = jabatanList.value.find((j: any) => j.id == id)
    return item ? item.nama : (id || '-')
}

const getBiroName = (id: any) => {
    const item = biroList.value.find((b: any) => b.id == id)
    return item ? item.nama : (id || '-')
}

const getStatusName = (id: any) => {
    const map: any = { '1': 'Promosi', '2': 'Mutasi', '3': 'Rotasi', '4': 'Demosi' }
    return map[id] || (id || '-')
}

const loading = ref(false)

const handleEditJafung = (item: any) => {
    editingJafungId.value = item.id
    jafungForm.value = {
        id_jafung: item.id_jafung,
        no_sk: item.no_sk,
        tmt: item.tmt
    }
    isFormJafungOpen.value = true
}

const handleEditJabatan = (item: any) => {
    editingJabatanId.value = item.id
    jabatanForm.value = {
        id_jabatan: item.id_jabatan || '',
        id_biro: item.id_biro || '',
        no_sk: item.no_sk || '',
        tmt: item.tmt || '',
        ikatan_kerja: item.ikatan_kerja || '1',
        is_aktiv: item.is_aktiv || 'Y',
        status: item.status || '',
        tanggal_keluar: item.tanggal_keluar ? (new Date(item.tanggal_keluar).toISOString().split('T')[0] as string) : ''
    }
    isFormJabatanOpen.value = true
}

const resetJafung = () => {
    isFormJafungOpen.value = false
    editingJafungId.value = null
    jafungForm.value = { id_jafung: 1, no_sk: '', tmt: '' }
}

const resetJabatan = () => {
    isFormJabatanOpen.value = false
    editingJabatanId.value = null
    jabatanForm.value = { id_jabatan: '', id_biro: '', no_sk: '', tmt: '', ikatan_kerja: '1', is_aktiv: 'Y', status: '', tanggal_keluar: '' }
}

const handleSubmitJafung = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('nik', props.nik)
    formData.append('id_jafung', jafungForm.value.id_jafung.toString())
    formData.append('no_sk', jafungForm.value.no_sk)
    formData.append('tmt', jafungForm.value.tmt)
    if (jafungFile.value?.files?.[0]) formData.append('upload_sk', jafungFile.value.files[0])

    const url = editingJafungId.value 
        ? `/api/kepegawaian/riwayat/riwayat_jafung/${editingJafungId.value}`
        : `/api/kepegawaian/riwayat/riwayat_jafung`
    
    const method = editingJafungId.value ? 'PUT' : 'POST'

    const res = await $fetch<any>(url, { method, body: formData })
    if (res.success) {
      showAlert(`Riwayat Jafung berhasil ${editingJafungId.value ? 'diperbarui' : 'ditambahkan'}`, 'success')
      resetJafung()
      emit('refresh')
    }
  } catch (e) { showAlert('Gagal memproses data', 'error') }
  finally { loading.value = false }
}

const handleSubmitJabatan = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('nik', props.nik)
    formData.append('id_jabatan', jabatanForm.value.id_jabatan)
    formData.append('id_biro', jabatanForm.value.id_biro)
    formData.append('no_sk', jabatanForm.value.no_sk)
    formData.append('tmt', jabatanForm.value.tmt)
    formData.append('ikatan_kerja', jabatanForm.value.ikatan_kerja)
    formData.append('is_aktiv', jabatanForm.value.is_aktiv)
    formData.append('status', jabatanForm.value.status)
    if (jabatanForm.value.tanggal_keluar) formData.append('tanggal_keluar', jabatanForm.value.tanggal_keluar)
    if (jabatanFile.value?.files?.[0]) formData.append('upload_sk', jabatanFile.value.files[0])

    const url = editingJabatanId.value 
        ? `/api/kepegawaian/riwayat/riwayat_jabatan/${editingJabatanId.value}`
        : `/api/kepegawaian/riwayat/riwayat_jabatan`
    
    const method = editingJabatanId.value ? 'PUT' : 'POST'

    const res = await $fetch<any>(url, { method, body: formData })
    if (res.success) {
      showAlert(`Riwayat Jabatan berhasil ${editingJabatanId.value ? 'diperbarui' : 'ditambahkan'}`, 'success')
      resetJabatan()
      emit('refresh')
    }
  } catch (e) { showAlert('Gagal memproses data', 'error') }
  finally { loading.value = false }
}

const handleDelete = (table: string, id: number) => {
  askConfirm(
    'Hapus Riwayat',
    'Apakah Anda yakin ingin menghapus catatan riwayat ini?',
    async () => {
      try {
        const res = await $fetch<any>(`/api/kepegawaian/riwayat/${table}/${id}`, { method: 'DELETE' })
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
  <div class="jabatan-section">
    <!-- JAFUNG SECTION -->
    <div class="section-block" v-if="props.type === 'dosen'">
      <div class="section-header">
        <h4>Riwayat Jabatan Akademik (Jafung)</h4>
        <button @click="isFormJafungOpen ? resetJafung() : (isFormJafungOpen = true)" class="btn-add">
          {{ isFormJafungOpen ? 'Batal' : '+ Tambah Jafung' }}
        </button>
      </div>

      <div v-if="isFormJafungOpen" class="form-card mb-4">
        <form @submit.prevent="handleSubmitJafung" class="premium-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Jabatan</label>
              <select v-model="jafungForm.id_jafung" class="glass-input">
                <option :value="1">Asisten Ahli</option>
                <option :value="2">Lektor</option>
                <option :value="3">Lektor Kepala</option>
                <option :value="4">Guru Besar</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nomor SK</label>
              <input v-model="jafungForm.no_sk" type="text" class="glass-input" required />
            </div>
            <div class="form-group">
              <label>TMT</label>
              <input v-model="jafungForm.tmt" type="text" class="glass-input" placeholder="DD-MM-YYYY" required />
            </div>
            <div class="form-group">
              <label>Update File SK (Opsional)</label>
              <input type="file" ref="jafungFile" class="glass-input" accept=".jpg,.jpeg,.png,.pdf" />
            </div>
          </div>
          <div class="form-footer">
          <button type="submit" :disabled="loading" class="btn-primary-lux">
            <span v-if="!loading">{{ editingJafungId ? 'Perbarui Jafung' : 'Simpan Jafung' }}</span>
            <div v-else class="spinner-small"></div>
          </button>
        </div>
        </form>
      </div>

      <table class="premium-table">
        <thead>
          <tr>
            <th>No. SK</th>
            <th>TMT</th>
            <th>Jabatan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in jafungData" :key="j.id">
            <td>{{ j.no_sk }}</td>
            <td>{{ j.tmt }}</td>
            <td>{{ getJafungName(j.id_jafung) }}</td>
            <td class="table-actions">
                <a v-if="j.upload_sk" :href="`/assets/SK/${j.upload_sk}`" target="_blank" title="Lihat SK" class="btn-view-sk">📄</a>
                <button @click="handleEditJafung(j)" title="Edit" class="btn-edit-icon">✏️</button>
                <button @click="handleDelete('riwayat_jafung', j.id)" title="Hapus" class="btn-del-icon">&times;</button>
            </td>
          </tr>
          <tr v-if="jafungData.length === 0">
            <td colspan="4" class="text-center text-muted">Belum ada riwayat jafung</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- STRUKTUR SECTION -->
    <div class="section-block mt-8">
      <div class="section-header">
        <h4>Riwayat Jabatan Struktural</h4>
        <button @click="isFormJabatanOpen ? resetJabatan() : (isFormJabatanOpen = true)" class="btn-add">
          {{ isFormJabatanOpen ? 'Batal' : '+ Tambah Jabatan' }}
        </button>
      </div>

      <div v-if="isFormJabatanOpen" class="form-card mb-4">
        <form @submit.prevent="handleSubmitJabatan" class="premium-form">
          <div class="form-grid">
            <div class="form-group full-width mb-6">
              <label>Nomor SK</label>
              <input v-model="jabatanForm.no_sk" type="text" class="glass-input-lux" placeholder="Masukkan Nomor SK..." required />
            </div>
            
            <div class="form-group">
              <label>Pilih Jabatan</label>
              <div class="select-wrapper">
                <select v-model="jabatanForm.id_jabatan" class="glass-input-lux" required>
                  <option value="" disabled>-- Pilih Jabatan --</option>
                  <option v-for="j in jabatanList" :key="j.id" :value="j.id" class="dark-option">{{ j.nama }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Unit / Biro</label>
              <div class="select-wrapper">
                <select v-model="jabatanForm.id_biro" class="glass-input-lux" required>
                  <option value="" disabled>-- Pilih Unit --</option>
                  <option v-for="b in biroList" :key="b.id" :value="b.id" class="dark-option">{{ b.nama }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>TMT Mulai</label>
              <input v-model="jabatanForm.tmt" type="text" class="glass-input-lux" placeholder="DD-MM-YYYY" required />
            </div>

            <div class="form-group">
              <label>TMT Selesai (Jika Mutasi)</label>
              <input v-model="jabatanForm.tanggal_keluar" type="date" class="glass-input-lux" />
            </div>

            <div class="form-group">
              <label>Keterangan (Mutasi/Promosi)</label>
              <div class="select-wrapper">
                <select v-model="jabatanForm.status" class="glass-input-lux">
                  <option value="">-- Pilih Keterangan --</option>
                  <option value="1" class="dark-option">Promosi</option>
                  <option value="2" class="dark-option">Mutasi</option>
                  <option value="3" class="dark-option">Rotasi</option>
                  <option value="4" class="dark-option">Demosi</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Status Jabatan</label>
              <div class="select-wrapper">
                <select v-model="jabatanForm.is_aktiv" class="glass-input-lux">
                  <option value="Y" class="dark-option">Aktif / Menjabat</option>
                  <option value="T" class="dark-option">Non-Aktif / Selesai</option>
                </select>
              </div>
            </div>

            <div class="form-group full-width">
              <label>Update File SK (Opsional)</label>
              <input type="file" ref="jabatanFile" class="glass-input-lux" accept=".jpg,.jpeg,.png,.pdf" />
            </div>
          </div>
          <div class="form-footer">
          <button type="submit" :disabled="loading" class="btn-primary-lux">
            <span v-if="!loading">{{ editingJabatanId ? 'Perbarui Jabatan' : 'Simpan Jabatan' }}</span>
            <div v-else class="spinner-small"></div>
          </button>
        </div>
        </form>
      </div>

      <table class="premium-table">
        <thead>
          <tr>
            <th>No. SK</th>
            <th>Masa Jabatan</th>
            <th>Jabatan & Unit</th>
            <th>Keterangan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in jabatanData" :key="j.id">
            <td>{{ j.no_sk }}</td>
            <td>
                {{ j.tmt }} 
                <span v-if="j.tanggal_keluar"> s/d {{ new Date(j.tanggal_keluar).toLocaleDateString('id-ID') }}</span>
            </td>
            <td class="name-highlight">
                <span class="jabatan-tag">{{ getJabatanName(j.id_jabatan) }}</span>
                <span class="sub-label">{{ getBiroName(j.id_biro) }}</span>
            </td>
            <td>{{ getStatusName(j.status) }}</td>
            <td>
              <span :class="['status-badge', j.is_aktiv === 'Y' ? 'active' : 'inactive']">
                {{ j.is_aktiv === 'Y' ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </td>
            <td class="table-actions">
                <a v-if="j.upload_sk" :href="`/assets/SK/${j.upload_sk}`" target="_blank" title="Lihat SK" class="btn-icon-lux view">📄</a>
                <button @click="handleEditJabatan(j)" title="Edit" class="btn-icon-lux edit">✏️</button>
                <button @click="handleDelete('riwayat_jabatan', j.id)" title="Hapus" class="btn-icon-lux delete">✕</button>
            </td>
          </tr>
          <tr v-if="jabatanData.length === 0">
            <td colspan="5" class="text-center text-muted">Belum ada riwayat jabatan struktural</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.jabatan-section { padding: 0.5rem; }
.section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; }
.section-header h4 { font-size: 1.3rem; font-weight: 700; color: #1e293b; letter-spacing: -0.02em; }

.btn-add { background: #6366f1; border: none; color: white; padding: 0.7rem 1.4rem; border-radius: 12px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25); }
.btn-add:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35); }

.form-card { background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(255,255,255,0.1); padding: 3rem; border-radius: 28px; margin-bottom: 4rem; backdrop-filter: blur(16px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); column-gap: 3.5rem; row-gap: 2rem; }
.form-group { margin-bottom: 0.5rem; }
.form-group.full-width { grid-column: span 2; }
.form-group label { display: block; font-size: 0.75rem; color: #6366f1; margin-bottom: 1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.9; }

.glass-input-lux { background: rgba(255, 255, 255, 0.9); border: 1px solid var(--glass-border); color: #1e293b; padding: 1rem 1.25rem; border-radius: 14px; width: 100%; outline: none; transition: all 0.25s ease; font-size: 0.95rem; }
.glass-input-lux:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

.form-footer { margin-top: 2.5rem; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-primary-lux { background: #6366f1; color: white; border: none; padding: 0.9rem 2.5rem; border-radius: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
.btn-primary-lux:hover { background: #4f46e5; transform: scale(1.02); }

.premium-table { width: 100%; border-collapse: separate; border-spacing: 0 0.75rem; margin-top: -0.75rem; }
.premium-table th { text-align: left; padding: 1.25rem 1.25rem; color: #475569; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 2px solid #f1f5f9; }
.premium-table td { padding: 1.6rem 1.25rem; background: #ffffff; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.premium-table tr:hover td { background: #f8fafc; transform: translateY(-1px); }
.premium-table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 16px; border-bottom-left-radius: 16px; color: #1e293b; font-weight: 700; }
.premium-table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 16px; border-bottom-right-radius: 16px; }

.name-highlight { color: #1e293b; font-weight: 800; font-size: 1.05rem; display: block; margin-bottom: 0.35rem; }
.jabatan-tag { background: #6366f1; color: #fff; padding: 0.1rem 0.6rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600; display: inline-block; }
.sub-label { color: #64748b; font-size: 0.82rem; font-weight: 600; display: block; margin-top: 0.4rem; }

.status-badge { padding: 0.5rem 1.1rem; border-radius: 10px; font-size: 0.72rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; display: inline-block; }
.status-badge.active { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
.status-badge.inactive { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

.table-actions { display: flex; gap: 0.75rem; align-items: center; }
.btn-icon-lux { background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; font-size: 1.2rem; text-decoration: none; }
.btn-icon-lux:hover { background: #fff; transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.btn-icon-lux.view { color: #10b981; }
.btn-icon-lux.edit { color: #6366f1; }
.btn-icon-lux.delete { color: #ef4444; }
.btn-icon-lux.delete:hover { background: #fef2f2; border-color: #fee2e2; }

.dark-option { background: #0f172a; color: #fff; }
</style>
