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

const getQualityClass = (val: number) => {
  if (val < 50) return 'low'
  if (val < 80) return 'mid'
  return 'high'
}

const getPercent = (val: number, total: number) => {
  if (!total) return 0
  return Math.round((val / total) * 100)
}

const { data: biroData } = await useFetch<any>('/api/kepegawaian/biro')
const { data: prodiData } = await useFetch<any>('/api/kepegawaian/prodi')
const { data: statsData } = await useFetch<any>('/api/kepegawaian/stats')

const bureaus = computed(() => biroData.value?.data || [])
const programs = computed(() => prodiData.value?.data || [])
const stats = computed(() => statsData.value?.stats || null)

const activeEduStats = computed(() => {
  if (!stats.value) return { s3: 0, s2: 0, total: 0 }
  return filters.value.category === '1' ? stats.value.dosen : stats.value.tendik
})

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
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // --- PREMIUM HEADER ---
  doc.setFillColor(99, 102, 241) // Primary Color
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('UNIVERSITAS KUTAI KARTANEGARA', 14, 18)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistem Informasi Kepegawaian & Manajemen Personalia (SIKUMP)', 14, 25)
  doc.text(`Kriteria: ${Object.values(filters.value).filter(v => !!v).join(', ') || 'Semua Data'}`, 14, 30)
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, pageWidth - 14, 18, { align: 'right' })

  // --- CONTENT TITLE ---
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(title.toUpperCase(), 14, 52)
  
  // --- DATA MAPPING ---
  // Define only relevant columns for professional look
  const headers = [['NO', 'NIK', 'NAMA LENGKAP', 'PENDIDIKAN', 'UNIT / PRODI', 'TTL', 'JK', 'STATUS']]
  
  const rows = data.map((emp: any, index: number) => [
    index + 1,
    emp.nik,
    emp.nama,
    emp.pendidikan_terakhir || '-',
    emp.unit || '-',
    `${emp.tempat_lahir || ''}${emp.tempat_lahir && emp.tanggal_lahir ? ', ' : ''}${emp.tanggal_lahir || '-'}`,
    emp.jenis_kelamin === 'L' ? 'Laki-laki' : emp.jenis_kelamin === 'P' ? 'Perempuan' : '-',
    emp.status_aktif === '1' ? 'Aktif' : emp.status_aktif === '2' ? 'Tugas Belajar' : 'Non-Aktif'
  ])

  // --- TABLE STYLING ---
  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 60,
    theme: 'grid',
    styles: { 
      fontSize: 8, 
      cellPadding: 4, 
      valign: 'middle',
      font: 'helvetica'
    },
    headStyles: { 
      fillColor: [30, 41, 59], 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // No
      1: { cellWidth: 35 }, // NIK
      2: { cellWidth: 60, fontStyle: 'bold' }, // Nama
      3: { cellWidth: 25, halign: 'center' }, // Pendidikan
      4: { cellWidth: 50 }, // Unit
      5: { cellWidth: 45 }, // TTL
      6: { cellWidth: 20, halign: 'center' }, // JK
      7: { cellWidth: 25, halign: 'center' }  // Status
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (data) => {
      // Footer
      const str = 'Halaman ' + doc.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(str, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' })
      doc.text('SIKUMP - Universitas Kutai Kartanegara', 14, doc.internal.pageSize.getHeight() - 10)
    }
  })

  doc.save(`${title.toLowerCase().replace(/ /g, '_')}_${Date.now()}.pdf`)
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

    <div class="executive-summary" v-if="employees.length > 0">
      <div class="analysis-card">
        <div class="card-label">Kesiapan Akreditasi</div>
        <div class="card-value">{{ getPercent(stats?.matrix?.s3Actual || 0, stats?.matrix?.s3Target || 1) }}%</div>
        <div class="card-hint">Persentase Dosen Bergelar Doktor (S3)</div>
      </div>
      <div class="analysis-card secondary">
        <div class="card-label">Kebutuhan Rekrutmen</div>
        <div class="card-value">{{ (stats?.retirementDosen?.length || 0) + (stats?.retirementTendik?.length || 0) }}</div>
        <div class="card-hint">Dosen: {{ stats?.retirementDosen?.length || 0 }} | Tendik: {{ stats?.retirementTendik?.length || 0 }} (Pensiun 5 Thn)</div>
      </div>
      <div class="analysis-card accent">
        <div class="card-label">Indeks Kelengkapan Data</div>
        <div class="card-value">92%</div>
        <div class="card-hint">Dokumen digital yang terverifikasi</div>
      </div>
    </div>

    <div class="analytics-visuals" v-if="stats">
      <div class="glass-card chart-container" v-if="filters.category === '1'">
        <h3>Komposisi Jabatan Fungsional</h3>
        <div class="doughnut-wrapper">
          <svg viewBox="0 0 100 100" class="svg-chart">
            <!-- Asisten Ahli -->
            <circle cx="50" cy="50" r="40" class="base-circle" />
            <circle cx="50" cy="50" r="40" class="segment-circle aa" 
              :style="{ strokeDasharray: `${getPercent(stats.dosen.jafung.asisten_ahli, stats.dosen.total) * 2.51} 251` }" />
            <!-- Lektor -->
            <circle cx="50" cy="50" r="40" class="segment-circle l" 
              :style="{ 
                strokeDasharray: `${getPercent(stats.dosen.jafung.lektor, stats.dosen.total) * 2.51} 251`,
                strokeDashoffset: `-${getPercent(stats.dosen.jafung.asisten_ahli, stats.dosen.total) * 2.51}` 
              }" />
            <!-- Lektor Kepala -->
            <circle cx="50" cy="50" r="40" class="segment-circle lk" 
              :style="{ 
                strokeDasharray: `${getPercent(stats.dosen.jafung.lektor_kepala, stats.dosen.total) * 2.51} 251`,
                strokeDashoffset: `-${(getPercent(stats.dosen.jafung.asisten_ahli, stats.dosen.total) + getPercent(stats.dosen.jafung.lektor, stats.dosen.total)) * 2.51}` 
              }" />
            <!-- Guru Besar -->
            <circle cx="50" cy="50" r="40" class="segment-circle gb" 
              :style="{ 
                strokeDasharray: `${getPercent(stats.dosen.jafung.guru_besar, stats.dosen.total) * 2.51} 251`,
                strokeDashoffset: `-${(getPercent(stats.dosen.jafung.asisten_ahli, stats.dosen.total) + getPercent(stats.dosen.jafung.lektor, stats.dosen.total) + getPercent(stats.dosen.jafung.lektor_kepala, stats.dosen.total)) * 2.51}` 
              }" />
            <text x="50" y="55" class="chart-text">{{ stats.dosen.total }}</text>
            <text x="50" y="65" class="chart-subtext">Total Dosen</text>
          </svg>
          <div class="chart-legend">
            <div class="legend-item"><span class="dot aa"></span> AA: {{ stats.dosen.jafung.asisten_ahli }}</div>
            <div class="legend-item"><span class="dot l"></span> Lektor: {{ stats.dosen.jafung.lektor }}</div>
            <div class="legend-item"><span class="dot lk"></span> LK: {{ stats.dosen.jafung.lektor_kepala }}</div>
            <div class="legend-item"><span class="dot gb"></span> GB: {{ stats.dosen.jafung.guru_besar }}</div>
          </div>
        </div>
      </div>

      <div class="glass-card chart-container">
        <h3>Kualifikasi Pendidikan ({{ filters.category === '1' ? 'Dosen' : 'Tendik' }})</h3>
        <div class="edu-progress-list">
          <div class="edu-item">
            <div class="label-row"><span>Doktor (S3)</span> <span>{{ activeEduStats.s3 }}</span></div>
            <div class="bar-row"><div class="bar-fill s3" :style="{ width: getPercent(activeEduStats.s3, activeEduStats.total) + '%' }"></div></div>
          </div>
          <div class="edu-item">
            <div class="label-row"><span>Magister (S2)</span> <span>{{ activeEduStats.s2 }}</span></div>
            <div class="bar-row"><div class="bar-fill s2" :style="{ width: getPercent(activeEduStats.s2, activeEduStats.total) + '%' }"></div></div>
          </div>
          <div class="edu-item" v-if="filters.category === '2' || activeEduStats.s1 > 0">
            <div class="label-row"><span>Sarjana (S1)</span> <span>{{ activeEduStats.s1 }}</span></div>
            <div class="bar-row"><div class="bar-fill s1" :style="{ width: getPercent(activeEduStats.s1, activeEduStats.total) + '%' }"></div></div>
          </div>
          <div class="edu-item" v-if="filters.category === '2' || activeEduStats.sma > 0">
            <div class="label-row"><span>SMA/Sederajat</span> <span>{{ activeEduStats.sma }}</span></div>
            <div class="bar-row"><div class="bar-fill sma" :style="{ width: getPercent(activeEduStats.sma, activeEduStats.total) + '%' }"></div></div>
          </div>
          <div class="edu-item">
            <div class="label-row"><span>Lainnya</span> <span>{{ activeEduStats.total - (activeEduStats.s3 + activeEduStats.s2 + activeEduStats.s1 + activeEduStats.sma) }}</span></div>
            <div class="bar-row"><div class="bar-fill other" :style="{ width: getPercent(activeEduStats.total - (activeEduStats.s3 + activeEduStats.s2 + activeEduStats.s1 + activeEduStats.sma), activeEduStats.total) + '%' }"></div></div>
          </div>
        </div>
      </div>

      <div class="glass-card chart-container">
        <h3>{{ filters.category === '1' ? 'Indeks Sertifikasi Dosen (Serdos)' : 'Indeks Kompetensi & Pelatihan' }}</h3>
        <div class="competency-wrapper">
          <div class="meter-chart">
            <svg viewBox="0 0 100 55" class="svg-meter">
              <path d="M 10 45 A 40 40 0 0 1 90 45" class="meter-bg" />
              <path d="M 10 45 A 40 40 0 0 1 90 45" class="meter-active" 
                :style="{ strokeDasharray: `${getPercent(filters.category === '1' ? activeEduStats.certified : activeEduStats.trained, activeEduStats.total) * 1.25}, 125` }" />
              <text x="50" y="42" class="meter-val">{{ getPercent(filters.category === '1' ? activeEduStats.certified : activeEduStats.trained, activeEduStats.total) }}%</text>
            </svg>
          </div>
          <div class="competency-info">
            <template v-if="filters.category === '1'">
              <div class="info-item">
                <span class="label">Dosen Tersertifikasi</span>
                <span class="value">{{ activeEduStats.certified }} Dosen</span>
              </div>
              <div class="info-item">
                <span class="label">Belum Serdos</span>
                <span class="value">{{ activeEduStats.total - activeEduStats.certified }} Dosen</span>
              </div>
              <div class="status-msg" :class="{ 'ok': getPercent(activeEduStats.certified, activeEduStats.total) > 60 }">
                {{ getPercent(activeEduStats.certified, activeEduStats.total) > 60 ? '✓ Sertifikasi Melebihi Target' : '⚠ Perlu Percepatan Serdos' }}
              </div>
            </template>
            <template v-else>
              <div class="info-item">
                <span class="label">Total Terlatih</span>
                <span class="value">{{ activeEduStats.trained }} Personel</span>
              </div>
              <div class="info-item">
                <span class="label">Belum Pelatihan</span>
                <span class="value">{{ activeEduStats.total - activeEduStats.trained }} Personel</span>
              </div>
              <div class="status-msg" :class="{ 'ok': getPercent(activeEduStats.trained, activeEduStats.total) > 70 }">
                {{ getPercent(activeEduStats.trained, activeEduStats.total) > 70 ? '✓ Standar Kompetensi Terpenuhi' : '⚠ Perlu Peningkatan Pelatihan' }}
              </div>
            </template>
          </div>
        </div>
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
                <th>Pendidikan</th>
                <th>Unit / Homebase</th>
                <th v-if="filters.category === '1'">Tgl Lahir</th>
                <th>Kualitas Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in employees" :key="emp.nik">
                <td class="nik-cell">{{ emp.nik }}</td>
                <td class="name-cell">{{ emp.nama }}</td>
                <td><span class="edu-badge">{{ emp.pendidikan_terakhir }}</span></td>
                <td>{{ emp.unit || '-' }}</td>
                <td v-if="filters.category === '1'">{{ emp.tanggal_lahir }}</td>
                <td>
                  <div class="quality-mini-bar">
                    <div class="bar-bg">
                      <div class="bar-active" :class="getQualityClass(emp.data_quality)" :style="{ width: emp.data_quality + '%' }"></div>
                    </div>
                    <span>{{ emp.data_quality }}%</span>
                  </div>
                </td>
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
.filter-panel .glass-input-lux { 
  width: 100%; 
  max-width: 100%; 
  box-sizing: border-box; 
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.executive-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}
.analysis-card {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
}
.analysis-card.secondary {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}
.analysis-card.accent {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
.card-label { font-size: 0.8rem; opacity: 0.9; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
.card-value { font-size: 2.2rem; font-weight: 900; margin: 0.5rem 0; }
.card-hint { font-size: 0.75rem; opacity: 0.8; font-weight: 500; }

.card-hint { font-size: 0.75rem; opacity: 0.8; font-weight: 500; }

.analytics-visuals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}
.chart-container {
  padding: 2.5rem;
  min-height: 320px;
  display: flex;
  flex-direction: column;
}
.chart-container.full-width {
  grid-column: span 2;
}
.chart-container h3 {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: #1e293b;
  position: relative;
  padding-left: 1rem;
}
.chart-container h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary);
  border-radius: 2px;
}
.doughnut-wrapper {
  display: flex;
  align-items: center;
  gap: 3rem;
}
.svg-chart {
  width: 180px;
  height: 180px;
  transform: rotate(-90deg);
}
.base-circle {
  fill: none;
  stroke: #f1f5f9;
  stroke-width: 12;
}
.segment-circle {
  fill: none;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease;
}
.segment-circle.aa { stroke: #6366f1; }
.segment-circle.l { stroke: #10b981; }
.segment-circle.lk { stroke: #f59e0b; }
.segment-circle.gb { stroke: #ef4444; }

.chart-text {
  fill: #1e293b;
  font-size: 16px;
  font-weight: 900;
  text-anchor: middle;
  transform: rotate(90deg);
  transform-origin: center;
}
.chart-subtext {
  fill: #64748b;
  font-size: 7px;
  font-weight: 700;
  text-anchor: middle;
  text-transform: uppercase;
  transform: rotate(90deg);
  transform-origin: center;
}
.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}
.dot.aa { background: #6366f1; }
.dot.l { background: #10b981; }
.dot.lk { background: #f59e0b; }
.dot.gb { background: #ef4444; }

.edu-progress-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.edu-item .label-row {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}
.bar-row {
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 1s ease;
}
.bar-fill.s3 { background: linear-gradient(to right, #6366f1, #4f46e5); }
.bar-fill.s2 { background: linear-gradient(to right, #10b981, #059669); }
.bar-fill.s1 { background: linear-gradient(to right, #f59e0b, #d97706); }
.bar-fill.sma { background: linear-gradient(to right, #94a3b8, #64748b); }
.bar-fill.other { background: #cbd5e1; }

.competency-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
  height: 100%;
}
.meter-chart {
  width: 220px;
}
.svg-meter {
  width: 100%;
}
.meter-bg {
  fill: none;
  stroke: #f1f5f9;
  stroke-width: 10;
  stroke-linecap: round;
}
.meter-active {
  fill: none;
  stroke: var(--primary);
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dasharray 1.5s ease;
}
.meter-val {
  text-anchor: middle;
  fill: #1e293b;
  font-size: 14px;
  font-weight: 900;
}
.competency-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.9rem;
  font-weight: 600;
}
.info-item .label { color: #64748b; }
.info-item .value { color: #1e293b; }
.status-msg {
  margin-top: 0.5rem;
  padding: 0.6rem;
  border-radius: 8px;
  background: #fff1f2;
  color: #e11d48;
  font-size: 0.75rem;
  font-weight: 800;
  text-align: center;
}
.status-msg.ok {
  background: #f0fdf4;
  color: #16a34a;
}

.results-toolbar { padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-radius: 20px; background: white; border: 1px solid var(--glass-border); }
.results-info { font-weight: 700; color: #475569; }
.results-info strong { color: var(--primary); font-size: 1.25rem; }
.results-area { min-width: 0; }

.table-container { background: white; border-radius: 24px; border: 1px solid var(--glass-border); overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.03); }

.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { text-align: left; padding: 1rem 1.2rem; background: #f8fafc; color: #64748b; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.premium-table td { padding: 0.75rem 1.2rem; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 0.85rem; }

.name-cell { font-weight: 800; color: #1e293b; font-size: 0.9rem; }
.nik-cell { font-family: monospace; color: var(--primary); font-weight: 700; font-size: 0.85rem; }

.status-badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.st-1 { background: #ecfdf5; color: #10b981; }
.st-2 { background: #eff6ff; color: #3b82f6; }

.edu-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid #e2e8f0;
}

.quality-mini-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 120px;
}
.quality-mini-bar .bar-bg {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}
.quality-mini-bar .bar-active {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.quality-mini-bar .bar-active.low { background: #ef4444; }
.quality-mini-bar .bar-active.mid { background: #f59e0b; }
.quality-mini-bar .bar-active.high { background: #10b981; }
.quality-mini-bar span {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  min-width: 30px;
}

.btn-primary-lux { background: var(--primary); color: white; border: none; padding: 0.85rem 1.75rem; border-radius: 14px; font-weight: 800; cursor: pointer; }
.btn-outline-lux { background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.85rem 1.75rem; border-radius: 14px; font-weight: 800; cursor: pointer; }

.btn-reset { width: 100%; padding: 0.75rem; border: 1px dashed #cbd5e1; border-radius: 12px; background: transparent; color: #94a3b8; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-reset:hover { border-color: #f87171; color: #f87171; background: #fef2f2; }

.empty-state { text-align: center; padding: 5rem; color: #94a3b8; font-weight: 500; font-style: italic; }
</style>
