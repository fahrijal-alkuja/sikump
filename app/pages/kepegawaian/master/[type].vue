<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const route = useRoute()
const type = computed(() => route.params.type as string)

const labels: any = {
  pangkat: 'Pangkat & Golongan',
  jafung: 'Jabatan Akademik (Jafung)',
  jabatan: 'Jabatan Struktural',
  prodi: 'Program Studi',
  biro: 'Biro / Lembaga'
}

const { data: masterData, refresh } = await useFetch<any>(() => `/api/kepegawaian/master/${type.value}`)
const list = computed(() => masterData.value?.success ? masterData.value.data : [])

const showModal = ref(false)
const selectedItem = ref<any>(null)
const isSaving = ref(false)

const form = ref<any>({
  id: '',
  nama: '',
  golongan: '',
  id_jaf: '',
  nama_fakultas: ''
})

const openModal = (item: any = null) => {
  selectedItem.value = item
  if (item) {
    form.value = { ...item }
  } else {
    form.value = { id: '', nama: '', golongan: '', id_jaf: '', nama_fakultas: '' }
  }
  showModal.value = true
}

const save = async () => {
  if (!form.value.nama) return
  isSaving.value = true
  try {
    const url = selectedItem.value ? `/api/kepegawaian/master/${type.value}/${selectedItem.value.id}` : `/api/kepegawaian/master/${type.value}`
    const method = selectedItem.value ? 'PUT' : 'POST'
    const res = await $fetch<any>(url, { method, body: form.value })
    if (res.success) {
      showModal.value = false
      refresh()
    } else {
      alert(res.message)
    }
  } catch (e) {
    alert('Terjadi kesalahan')
  } finally {
    isSaving.value = false
  }
}

const remove = async (id: any) => {
  if (!confirm('Hapus data master ini?')) return
  try {
    const res = await $fetch<any>(`/api/kepegawaian/master/${type.value}/${id}`, { method: 'DELETE' })
    if (res.success) refresh()
  } catch (e) {
    alert('Gagal menghapus')
  }
}

watch(type, () => refresh())
</script>

<template>
  <div class="master-page">
    <div class="page-header">
      <div>
        <h1>Kelola {{ labels[type] || 'Data Master' }}</h1>
        <p class="subtitle">Manajemen referensi data dasar sistem kepegawaian UNIKARTA</p>
      </div>
      <button class="btn-primary" @click="openModal()">+ Tambah {{ labels[type] }} Baru</button>
    </div>

    <div class="glass-card table-section">
      <table class="premium-table">
        <thead>
          <tr>
            <th v-if="type === 'prodi' || type === 'pangkat'">ID / Kode</th>
            <th>{{ type === 'pangkat' ? 'Pangkat' : 'Nama' }}</th>
            <th v-if="type === 'pangkat'">Golongan</th>
            <th v-if="type === 'prodi'">Fakultas</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td v-if="type === 'prodi' || type === 'pangkat'" class="code-cell">{{ item.id }}</td>
            <td class="name-cell">{{ item.nama }}</td>
            <td v-if="type === 'pangkat'">{{ item.golongan }}</td>
            <td v-if="type === 'prodi'">{{ item.nama_fakultas }}</td>
            <td class="actions">
              <button @click="openModal(item)" class="btn-icon edit" title="Edit">✏️</button>
              <button @click="remove(item.id)" class="btn-icon delete" title="Hapus">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Master Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-container glass-card">
          <div class="modal-header">
            <h3>{{ selectedItem ? 'Perbarui' : 'Tambah' }} {{ labels[type] }}</h3>
            <button class="btn-close" @click="showModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div v-if="type === 'prodi'" class="form-group full">
                <label>Kode Program Studi</label>
                <input v-model="form.id" type="text" class="glass-input" :disabled="!!selectedItem" />
              </div>
              
              <div class="form-group" :class="{ full: type !== 'pangkat' }">
                <label>{{ type === 'pangkat' ? 'Nama Pangkat' : 'Nama Lengkap' }}</label>
                <input v-model="form.nama" type="text" class="glass-input" />
              </div>

              <template v-if="type === 'pangkat'">
                <div class="form-group">
                  <label>Golongan</label>
                  <input v-model="form.golongan" type="text" class="glass-input" placeholder="Contoh: IV/a" />
                </div>
                <div class="form-group full">
                  <label>ID Jafung Terkait</label>
                  <input v-model="form.id_jaf" type="text" class="glass-input" />
                </div>
              </template>

              <template v-if="type === 'prodi'">
                <div class="form-group full">
                  <label>Nama Fakultas</label>
                  <input v-model="form.nama_fakultas" type="text" class="glass-input" />
                </div>
              </template>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="showModal = false">Batal</button>
            <button class="btn-primary" @click="save" :disabled="isSaving">
              {{ isSaving ? 'Memproses...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.master-page { 
  padding: 1rem 2rem 5rem;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

h1 { 
  font-size: 2.25rem; 
  font-weight: 900; 
  letter-spacing: -1px;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.subtitle { color: var(--text-muted); font-size: 0.95rem; }

.table-section {
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: white;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03);
}

.premium-table { 
  width: 100%; 
  border-collapse: collapse; 
  font-size: 0.95rem;
}

.premium-table th { 
  text-align: left; 
  padding: 1.5rem; 
  color: #64748b; 
  font-weight: 800;
  font-size: 0.75rem; 
  text-transform: uppercase; 
  letter-spacing: 1px;
  background: #f8fafc;
  border-bottom: 2px solid #f1f5f9;
}

.premium-table td { 
  padding: 1.4rem 1.5rem; 
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
  color: #475569;
}

.premium-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.code-cell { 
  font-family: 'JetBrains Mono', monospace; 
  color: #818cf8; 
  font-weight: 600; 
  font-size: 0.85rem;
}

.name-cell { 
  font-weight: 800; 
  color: #1e293b; 
  font-size: 1.05rem;
}

.actions { display: flex; gap: 0.75rem; }

.btn-icon { 
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  cursor: pointer; 
  transition: all 0.3s;
  color: #64748b;
  font-size: 1.1rem;
}

.btn-icon:hover { 
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.btn-icon.edit:hover { 
  color: #60a5fa; 
  border-color: rgba(96, 165, 250, 0.4);
  background: rgba(96, 165, 250, 0.1);
}

.btn-icon.delete:hover { 
  color: #ef4444; 
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.1);
}

.btn-primary { 
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white; 
  border: none; 
  padding: 0.85rem 1.75rem; 
  border-radius: 12px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
  filter: brightness(1.1);
}

/* Modal Enhancements */
.modal-overlay { 
  position: fixed; 
  top: 0; left: 0; 
  width: 100%; height: 100%; 
  background: rgba(15, 23, 42, 0.4); 
  backdrop-filter: blur(8px); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 2000; 
}

.modal-container { 
  width: 550px; 
  padding: 0; 
  background: white;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
}

.modal-header h3 { color: #1e293b; font-weight: 900; }
.modal-header { 
  padding: 1.75rem 2.5rem; 
  border-bottom: 1px solid #f1f5f9; 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  background: #f8fafc;
}

.modal-body { padding: 3rem 2.5rem; }
.modal-footer { 
  padding: 1.5rem 2rem; 
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05); 
  display: flex; 
  justify-content: flex-end; 
  gap: 1.25rem; 
}

.form-grid { display: flex; flex-direction: column; gap: 1.75rem; }
.form-group { display: flex; flex-direction: column; gap: 0.6rem; }
.form-group label { 
  font-size: 0.75rem; 
  font-weight: 700; 
  color: var(--text-muted); 
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.glass-input { 
  background: white; 
  border: 1px solid #e2e8f0; 
  color: #1e293b; 
  padding: 0.85rem 1.15rem; 
  border-radius: 12px; 
  outline: none; 
  transition: all 0.3s;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.glass-input:focus { 
  border-color: #6366f1; 
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.btn-ghost { 
  background: transparent; 
  color: #94a3b8; 
  border: none; 
  font-weight: 600; 
  cursor: pointer; 
  padding: 0.5rem 1rem;
  transition: 0.2s;
}

.btn-ghost:hover { color: #fff; }

.btn-close { 
  background: rgba(255, 255, 255, 0.05); 
  border: none; 
  color: #94a3b8; 
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; 
  transition: 0.2s;
}

.btn-close:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
</style>
