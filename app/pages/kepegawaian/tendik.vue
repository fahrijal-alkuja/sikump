<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')
const selectedBiro = ref('')
const showAddModal = ref(false)
const category = '2' // Fixed to Tendik

// Fetch Bureaus for Filter
const { data: biroData } = await useFetch('/api/kepegawaian/biro')
const bureaus = computed(() => {
  const d = biroData.value as any
  return d?.success ? d.data : []
})

// Fetch Personnel with Biro filter
// @ts-ignore
const { data: employeesData, refresh } = await useFetch('/api/kepegawaian', {
  watch: [selectedBiro],
  query: { 
    search,
    ikatan_kerja: category,
    biro_id: selectedBiro
  }
})

const handleSearch = () => refresh()
const handleSuccess = () => {
  showAddModal.value = false
  refresh()
}

const employees = computed<any[]>(() => {
  const d = employeesData.value as any
  return d?.success ? d.data : []
})
</script>

<template>
  <div class="kepegawaian-page">
    <div class="page-header">
      <div>
        <h1>Manajemen Data Tendik</h1>
        <p class="subtitle">Kelola informasi administrasi dan profil staf UNIKARTA</p>
      </div>
      <div class="action-group">
        <!-- Filter Biro -->
        <select v-model="selectedBiro" class="glass-input-lux filter-select">
          <option value="">Semua Unit / Biro</option>
          <option v-for="b in bureaus" :key="b.id" :value="b.id">{{ b.nama }}</option>
        </select>

        <div class="search-box">
          <input 
            v-model="search" 
            @input="handleSearch"
            type="text" 
            placeholder="Cari NIK atau Nama..." 
            class="glass-input-lux" 
          />
        </div>
        <button class="btn-primary-lux" @click="showAddModal = true">+ Tambah Tendik Baru</button>
      </div>
    </div>

    <!-- Modal Tendik -->
    <KepegawaianEmployeeModal 
      :show="showAddModal" 
      :type="'2'" 
      @close="showAddModal = false" 
      @success="handleSuccess"
    />

    <div class="glass-card table-section">
      <template v-if="employeesData?.success">
        <table class="premium-table" v-if="employees.length > 0">
          <thead>
            <tr>
              <th>NIK</th>
              <th>Nama Lengkap</th>
              <th>Unit Kerja / Biro</th>
              <th>Kelamin</th>
              <th>Kontak</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in employees" :key="emp.nik">
              <td class="nik-cell">{{ emp.nik }}</td>
              <td class="name-cell">{{ emp.nama }}</td>
              <td>
                <span class="unit-badge">{{ emp.unit || '-' }}</span>
              </td>
              <td>{{ emp.jenis_kelamin === 'L' ? 'L' : 'P' }}</td>
              <td>{{ emp.telepon || '-' }}</td>
              <td>
                <NuxtLink :to="`/kepegawaian/${emp.nik}`" class="btn-view">Detail Pegawai ↗</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">Data tenaga kependidikan tidak ditemukan.</div>
      </template>
      <div v-else class="loading-state">Menghubungkan ke database tendik...</div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
h1 { font-size: 2.2rem; font-weight: 900; margin-bottom: 0.25rem; color: #1e293b; }
.subtitle { color: #64748b; font-weight: 500; }

.action-group { display: flex; gap: 1rem; align-items: center; }
.glass-input-lux { background: white; border: 1px solid var(--glass-border); color: #1e293b; padding: 0.85rem 1.25rem; border-radius: 12px; outline: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.filter-select { width: 220px; cursor: pointer; }
.filter-select option { background: white; color: #1e293b; }

.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { text-align: left; padding: 1.2rem; color: #64748b; border-bottom: 2px solid var(--bg-main); font-size: 0.75rem; text-transform: uppercase; font-weight: 800; }
.premium-table td { padding: 1.4rem 1.2rem; border-bottom: 1px solid #f1f5f9; color: #475569; }

.unit-badge { background: rgba(99, 102, 241, 0.08); color: var(--primary); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; }
.nik-cell { color: var(--primary); font-family: monospace; font-size: 1rem; font-weight: 600; }
.name-cell { font-weight: 800; font-size: 1rem; color: #1e293b; }
.btn-view { color: var(--primary); text-decoration: none; font-weight: 700; font-size: 0.9rem; padding: 0.5rem 1rem; background: rgba(99,102,241,0.08); border-radius: 8px; transition: 0.2s; }
.btn-view:hover { background: var(--primary); color: white; }

.empty-state, .loading-state { text-align: center; padding: 5rem; color: var(--text-muted); }
</style>
