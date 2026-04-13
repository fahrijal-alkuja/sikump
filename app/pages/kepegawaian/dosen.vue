<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')
const showAddModal = ref(false)
const category = '1' // Fixed to Dosen

// @ts-ignore
const { data: employeesData, refresh } = await useFetch('/api/kepegawaian', {
  query: { 
    search,
    ikatan_kerja: category 
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
const user = useUser()
</script>

<template>
  <div class="kepegawaian-page">
    <div class="page-header">
      <div>
        <h1>Manajemen Data Dosen</h1>
        <p class="subtitle">Kelola informasi akademik dan profil dosen Unikarta</p>
      </div>
      <div class="action-group">
        <div class="search-box">
          <input 
            v-model="search" 
            @input="handleSearch"
            type="text" 
            placeholder="Cari NUPTK atau Nama Dosen..." 
            class="glass-input-lux" 
          />
        </div>
        <button class="btn-primary-lux" @click="showAddModal = true">+ Tambah Dosen Baru</button>
      </div>
    </div>

    <!-- Modal Dosen -->
    <KepegawaianEmployeeModal 
      :show="showAddModal" 
      :type="'1'" 
      @close="showAddModal = false" 
      @success="handleSuccess"
    />

    <div class="glass-card table-section">
      <template v-if="employeesData?.success">
        <table class="premium-table" v-if="employees.length > 0">
          <thead>
            <tr>
              <th>NUPTK</th>
              <th>NIK</th>
              <th>Nama Lengkap</th>
              <th>Program Studi</th>
              <th>Kontak</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in employees" :key="emp.nik">
              <td class="nik-cell">{{ emp.nuptk || '-' }}</td>
              <td class="nik-cell" style="color: var(--text-muted)">{{ emp.nik }}</td>
              <td class="name-cell">{{ emp.nama }}</td>
              <td>{{ emp.unit || '-' }}</td>
              <td>{{ emp.telepon || '-' }}</td>
              <td>
                <NuxtLink :to="`/kepegawaian/${emp.nik}`" class="btn-view">Detail ↗</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">Data dosen tidak ditemukan.</div>
      </template>
      <div v-else class="loading-state">Menghubungkan ke database dosen...</div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

h1 { font-size: 2.2rem; font-weight: 900; margin-bottom: 0.25rem; color: #1e293b; }
.subtitle { color: #64748b; font-weight: 500; }

.action-group { display: flex; gap: 1rem; align-items: center; }

.glass-input-lux {
  background: white;
  border: 1px solid var(--glass-border);
  color: #1e293b;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  outline: none;
  width: 350px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.glass-input-lux:focus {
  border-color: var(--primary);
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.1);
}

.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { text-align: left; padding: 1.2rem; color: #64748b; border-bottom: 2px solid var(--bg-main); font-size: 0.75rem; text-transform: uppercase; font-weight: 800; }
.premium-table td { padding: 1.4rem 1.2rem; border-bottom: 1px solid #f1f5f9; color: #475569; }
.name-cell { font-weight: 800; font-size: 1rem; color: #1e293b; }
.btn-view { color: var(--primary); text-decoration: none; font-weight: 700; font-size: 0.9rem; padding: 0.5rem 1rem; background: rgba(99,102,241,0.08); border-radius: 8px; transition: 0.2s; }
.btn-view:hover { background: var(--primary); color: white; }

.empty-state, .loading-state { text-align: center; padding: 5rem; color: var(--text-muted); }
</style>
