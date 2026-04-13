<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const isExporting = ref(false)
const isLoading = ref(false)

// Dynamic Filters
const filters = ref({
  category: '1', // 1: Dosen, 2: Tendik
  unit: '',
  education: '',
  jafung: '',
  status: '',
  search: ''
})

const { data: biroData } = await useFetch<any>('/api/kepegawaian/biro')
const { data: prodiData } = await useFetch<any>('/api/kepegawaian/prodi')

const bureaus = computed(() => biroData.value?.data || [])
const programs = computed(() => prodiData.value?.data || [])

const currentUnitOptions = computed(() => {
  return filters.value.category === '1' ? programs.value : bureaus.value
})

// Reference Maps
const educationLevels = [
  { id: '1', name: 'SD/SMP' },
  { id: '2', name: 'SMA/K' },
  { id: '3', name: 'D3/Diploma' },
  { id: '4', name: 'S1/Sarjana' },
  { id: '5', name: 'S2/Magister' },
  { id: '6', name: 'S3/Doktor' }
]

const ranks = [
  { id: '1', name: 'Asisten Ahli' },
  { id: '2', name: 'Lektor' },
  { id: '3', name: 'Lektor Kepala' },
  { id: '4', name: 'Guru Besar' }
]

const statuses = [
  { id: '1', name: 'Aktif' },
  { id: '2', name: 'Tugas Belajar' },
  { id: '3', name: 'Izin Belajar' },
  { id: '4', name: 'Cuti' },
  { id: '5', name: 'Non-Aktif' }
]

// Live Data Fetching
const { data: reportData, refresh } = await useFetch<any>('/api/kepegawaian', {
  query: computed(() => ({
    ikatan_kerja: filters.value.category,
    biro_id: filters.value.unit,
    education: filters.value.education,
    jafung: filters.value.jafung,
    status: filters.value.status,
    search: filters.value.search
  })),
  watch: [filters]
})

const employees = computed(() => reportData.value?.data || [])

// EXPORT LOGIC
const convertToCSV = (arr: any[]) => {
  if (!arr || arr.length === 0) return ''
  const headers = Object.keys(arr[0])
  const rows = arr.map(row => 
    headers.map(field => {
      let val = row[field] === null || row[field] === undefined ? '' : String(row[field])
      val = val.replace(/"/g, '""')
      return `"${val}"`
    }).join(';')
  )
  return [headers.join(';')].concat(rows).join('\n')
}

const downloadFile = (content: string, fileName: string, type: string) => {
  const blob = new Blob([content], { type })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleExport = async (format: 'excel' | 'pdf') => {
  if (employees.value.length === 0) return
  isExporting.value = true
  
  const title = `Laporan SDM ${filters.value.category === '1' ? 'Dosen' : 'Tendik'}`
  
  if (format === 'excel') {
    const csv = convertToCSV(employees.value)
    downloadFile(csv, `${title.toLowerCase().replace(/ /g, '_')}_${Date.now()}.csv`, 'text/csv;charset=utf-8;')
  } else {
    generateGenericPDF(title, employees.value)
  }
  
  isExporting.value = false
}

const generateGenericPDF = (title: string, data: any[]) => {
  const doc = new jsPDF('l', 'mm', 'a4')
  doc.setFontSize(18)
  doc.setTextColor(30, 41, 59)
  doc.text(title, 14, 15)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Kriteria: ${Object.values(filters.value).filter(v => !!v).join(', ') || 'Semua Data'}`, 14, 22)
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 27)
  
  const headers = [Object.keys(data[0]).map(h => h.replace('_', ' ').toUpperCase())]
  const rows = data.map((obj: any) => Object.values(obj)) as any[][]

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 33,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold' },
    margin: { top: 30 }
  })

  doc.save(`${title.toLowerCase().replace(/ /g, '_')}.pdf`)
}
</script>

<template>
  <div class="reports-page">
    <div class="page-header">
      <div>
        <h1>Dynamic Report Builder</h1>
        <p class="subtitle">Filter dan ekspor data kepegawaian spesifik sesuai kebutuhan administrasi</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary-lux" @click="handleExport('excel')" :disabled="!employees.length || isExporting">
           📥 Ekspor Excel (.csv)
        </button>
        <button class="btn-outline-lux" @click="handleExport('pdf')" :disabled="!employees.length || isExporting">
           📄 Cetak PDF
        </button>
      </div>
    </div>

    <div class="report-layout">
      <!-- Sidebar Filters -->
      <aside class="filter-panel glass-card">
        <div class="filter-section">
          <label>Kategori Pegawai</label>
          <div class="radio-group">
            <button :class="{ active: filters.category === '1' }" @click="filters.category = '1'">Dosen</button>
            <button :class="{ active: filters.category === '2' }" @click="filters.category = '2'">Tendik</button>
          </div>
        </div>

        <div class="filter-section">
          <label>Pendidikan Terakhir</label>
          <select v-model="filters.education" class="glass-input-lux">
            <option value="">Semua Jenjang</option>
            <option v-for="e in educationLevels" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
        </div>

        <div class="filter-section" v-if="filters.category === '1'">
          <label>Jabatan Akademik (Jafung)</label>
          <select v-model="filters.jafung" class="glass-input-lux">
            <option value="">Semua Jabatan</option>
            <option v-for="r in ranks" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>

        <div class="filter-section">
          <label>Status Aktif</label>
          <select v-model="filters.status" class="glass-input-lux">
            <option value="">Semua Status</option>
            <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <div class="filter-section">
          <label>{{ filters.category === '1' ? 'Program Studi' : 'Unit / Biro' }}</label>
          <select v-model="filters.unit" class="glass-input-lux">
            <option value="">{{ filters.category === '1' ? 'Semua Prodi' : 'Semua Unit' }}</option>
            <option v-for="opt in currentUnitOptions" :key="opt.id" :value="opt.id">{{ opt.nama }}</option>
          </select>
        </div>

        <div class="filter-footer">
          <button class="btn-reset" @click="filters = { category: '1', unit: '', education: '', jafung: '', status: '', search: '' }">
            Reset Filter
          </button>
        </div>
      </aside>

      <!-- Main Results Area -->
      <main class="results-area">
        <div class="results-toolbar glass-card">
          <div class="results-info">
             Menampilkan 🛡️ <strong>{{ employees.length }}</strong> Personel Terdeteksi
          </div>
          <div class="search-box">
             <input v-model="filters.search" placeholder="Cari Nama/NIK..." class="glass-input-lux" />
          </div>
        </div>

        <div class="table-container glass-card">
          <table class="premium-table">
            <thead>
              <tr>
                <th>NIK</th>
                <th>Nama Lengkap</th>
                <th>Unit / Homebase</th>
                <th v-if="filters.category === '1'">Tgl Lahir</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in employees" :key="emp.nik">
                <td class="nik-cell">{{ emp.nik }}</td>
                <td class="name-cell">{{ emp.nama }}</td>
                <td>{{ emp.unit || '-' }}</td>
                <td v-if="filters.category === '1'">{{ emp.tanggal_lahir }}</td>
                <td>
                  <span :class="['status-badge', `st-${emp.status_aktif || 1}`]">
                    {{ emp.status_aktif === '2' ? 'Tugas Belajar' : 'Aktif' }}
                  </span>
                </td>
              </tr>
              <tr v-if="!employees.length">
                <td colspan="5" class="empty-state">Data tidak ditemukan dengan kriteria tersebut.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.reports-page { padding-bottom: 5rem; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
h1 { font-size: 2.5rem; font-weight: 900; color: #1e293b; letter-spacing: -1px; }
.subtitle { color: #64748b; font-weight: 500; }

.header-actions { display: flex; gap: 1rem; }

.report-layout { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; align-items: flex-start; }

.filter-panel { padding: 2.5rem; position: sticky; top: 2rem; background: white; border-radius: 24px; border: 1px solid var(--glass-border); box-shadow: 0 10px 25px rgba(0,0,0,0.03); }
.filter-section { margin-bottom: 2rem; }
.filter-section label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 0.75rem; letter-spacing: 0.05em; }

.radio-group { display: flex; background: #f1f5f9; padding: 0.3rem; border-radius: 12px; }
.radio-group button { flex: 1; padding: 0.6rem; border: none; background: transparent; color: #64748b; font-weight: 700; border-radius: 10px; cursor: pointer; transition: 0.2s; }
.radio-group button.active { background: white; color: var(--primary); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

.results-toolbar { padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-radius: 20px; background: white; border: 1px solid var(--glass-border); }
.results-info { font-weight: 700; color: #475569; }
.results-info strong { color: var(--primary); font-size: 1.25rem; }
.results-area { min-width: 0; }

.table-container { background: white; border-radius: 24px; border: 1px solid var(--glass-border); overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.03); }

.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { text-align: left; padding: 1.5rem; background: #f8fafc; color: #64748b; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.premium-table td { padding: 1.4rem 1.5rem; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 0.95rem; }

.name-cell { font-weight: 800; color: #1e293b; }
.nik-cell { font-family: monospace; color: var(--primary); font-weight: 700; }

.status-badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.st-1 { background: #ecfdf5; color: #10b981; }
.st-2 { background: #eff6ff; color: #3b82f6; }

.btn-primary-lux { background: var(--primary); color: white; border: none; padding: 0.85rem 1.75rem; border-radius: 14px; font-weight: 800; cursor: pointer; }
.btn-outline-lux { background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.85rem 1.75rem; border-radius: 14px; font-weight: 800; cursor: pointer; }

.btn-reset { width: 100%; padding: 0.75rem; border: 1px dashed #cbd5e1; border-radius: 12px; background: transparent; color: #94a3b8; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-reset:hover { border-color: #f87171; color: #f87171; background: #fef2f2; }

.empty-state { text-align: center; padding: 5rem; color: #94a3b8; font-weight: 500; font-style: italic; }
</style>
