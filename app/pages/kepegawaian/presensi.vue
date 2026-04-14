<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'default',
  // @ts-ignore
  middleware: 'admin'
})

const now = new Date()
const selectedMonth = ref(now.getMonth() + 1)
const selectedYear = ref(now.getFullYear())
const search = ref('')

const monthOptions = [
  { label: "Januari", value: 1 }, { label: "Februari", value: 2 }, { label: "Maret", value: 3 },
  { label: "April", value: 4 }, { label: "Mei", value: 5 }, { label: "Juni", value: 6 },
  { label: "Juli", value: 7 }, { label: "Agustus", value: 8 }, { label: "September", value: 9 },
  { label: "Oktober", value: 10 }, { label: "November", value: 11 }, { label: "Desember", value: 12 }
]

const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

const getMonthString = computed(() => 
  `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`
)

const { data: absenData, refresh, pending } = await useFetch<any>('/api/kepegawaian/stats/absensi', {
  query: { bulan: getMonthString }
})

const absens = computed(() => absenData.value?.success ? absenData.value.data : [])

const filteredAbsens = computed(() => {
  if (!search.value) return absens.value
  const s = search.value.toLowerCase()
  return absens.value.filter((a: any) => 
    a.nama.toLowerCase().includes(s) || a.nik.includes(s) || a.biro.toLowerCase().includes(s)
  )
})

const stats = computed(() => {
  if (absens.value.length === 0) return { avg: 0, total: 0, perfect: 0 }
  const total = absens.value.length
  const sum = absens.value.reduce((acc: number, curr: any) => acc + curr.score, 0)
  const perfect = absens.value.filter((a: any) => a.hadir >= 22 && a.telat === 0).length
  return {
    avg: (sum / total).toFixed(1),
    total,
    perfect
  }
})

const getScoreColor = (score: number) => {
  if (score >= 90) return '#10b981'
  if (score >= 70) return '#f59e0b'
  return '#ef4444'
}
</script>

<template>
  <div class="presensi-page">
    <header class="page-header">
      <div class="header-content">
        <h1>Presensi Analytics Command</h1>
        <p>Audit Kedisiplinan & Stabilitas SDM Tendik Unikarta</p>
      </div>
      <div class="header-actions">
        <div class="filter-group">
          <select v-model="selectedMonth" class="elite-select">
            <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <select v-model="selectedYear" class="elite-select">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
          <button @click="refresh()" class="btn-refresh" :class="{ rotating: pending }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path></svg>
          </button>
        </div>
      </div>
    </header>

    <!-- TOP INSIGHT CARDS -->
    <div class="insight-grid">
      <div class="insight-card glass">
        <div class="i-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg></div>
        <div class="i-info">
          <label>Total Personil</label>
          <span class="v">{{ stats.total }}</span>
        </div>
      </div>
      <div class="insight-card glass">
        <div class="i-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
        <div class="i-info">
          <label>Audit Kehadiran (Avg)</label>
          <span class="v">{{ stats.avg }}%</span>
        </div>
      </div>
      <div class="insight-card glass">
        <div class="i-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg></div>
        <div class="i-info">
          <label>Perfect Attendance</label>
          <span class="v">{{ stats.perfect }} Staff</span>
        </div>
      </div>
    </div>

    <!-- MAIN DATA TABLE -->
    <section class="table-section glass mt-8">
      <div class="table-header">
        <div class="t-title">Detailed Discipline Audit</div>
        <div class="t-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input v-model="search" type="text" placeholder="Cari nama, nik, atau biro...">
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Personil</th>
              <th>Unit Kerja</th>
              <th>Jabatan</th>
              <th>Hadir (Hari)</th>
              <th>Telat (Kali)</th>
              <th>Score Disiplin</th>
              <th>Status Map</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in filteredAbsens" :key="a.nik">
              <td>
                <div class="user-cell">
                  <div class="u-avatar">{{ a.nama[0] }}</div>
                  <div class="u-meta">
                    <span class="n">{{ a.nama }}</span>
                    <span class="k">{{ a.nik }}</span>
                  </div>
                </div>
              </td>
              <td class="biro-cell">{{ a.biro }}</td>
              <td class="jab-cell">{{ a.jabatan }}</td>
              <td class="center-cell"><span class="val-num">{{ a.hadir }}</span></td>
              <td class="center-cell"><span :class="['val-num', { 'is-late': a.telat > 0 }]">{{ a.telat }}</span></td>
              <td>
                <div class="score-pill" :style="{ background: getScoreColor(a.score) + '20', color: getScoreColor(a.score) }">
                   {{ a.score }}%
                </div>
              </td>
              <td>
                <span v-if="a.isMapped" class="status-badge success">Tersinkron</span>
                <span v-else class="status-badge danger">Gagal Map</span>
              </td>
            </tr>
            <tr v-if="filteredAbsens.length === 0">
              <td colspan="7" class="empty-row">Data tidak ditemukan untuk periode ini.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.presensi-page { padding: 2rem; color: #1e293b; min-height: 100vh; background: #f8fafc; }

.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
.page-header h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 900; background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
.page-header p { font-size: 1rem; color: #64748b; font-weight: 600; margin-top: 0.5rem; }

.header-actions { display: flex; gap: 1rem; }
.filter-group { display: flex; background: white; padding: 0.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; gap: 0.5rem; align-items: center; }
.elite-select { border: none; padding: 0.5rem 1rem; font-weight: 800; color: #475569; background: transparent; cursor: pointer; outline: none; }
.btn-refresh { background: #6366f1; color: white; border: none; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
.btn-refresh:hover { transform: scale(1.05); background: #4f46e5; }
.btn-refresh svg { width: 18px; height: 18px; }
.rotating svg { animation: spin 1s linear infinite; }

@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }

.insight-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.insight-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; border-radius: 24px; }
.i-icon { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
.i-icon svg { width: 28px; height: 28px; }
.i-icon.blue { background: #eff6ff; color: #3b82f6; }
.i-icon.green { background: #f0fdf4; color: #22c55e; }
.i-icon.gold { background: #fffbeb; color: #f59e0b; }
.i-info label { display: block; font-size: 0.8rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.i-info .v { font-size: 1.8rem; font-weight: 900; color: #1e293b; line-height: 1; }

.table-section { padding: 2rem; border-radius: 32px; border: 1px solid rgba(255,255,255,0.7); overflow: hidden; }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.t-title { font-size: 1.25rem; font-weight: 900; color: #334155; }
.t-search { position: relative; width: 350px; }
.t-search svg { position: absolute; left: 14px; top: 12px; width: 18px; color: #94a3b8; }
.t-search input { width: 100%; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 0.75rem 1rem 0.75rem 2.5rem; border-radius: 14px; outline: none; transition: all 0.3s; font-weight: 600; }
.t-search input:focus { background: white; border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
thead th { padding: 1rem; text-align: left; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
tbody tr { background: white; transition: all 0.3s ease; }
tbody tr:hover { transform: scale(1.005); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
tbody td { padding: 1.25rem 1rem; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; }
tbody td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
tbody td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 16px; border-bottom-right-radius: 16px; }

.user-cell { display: flex; align-items: center; gap: 12px; }
.u-avatar { width: 44px; height: 44px; background: #6366f1; color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; }
.u-meta .n { display: block; font-weight: 900; color: #1e293b; }
.u-meta .k { font-size: 0.75rem; color: #94a3b8; }

.val-num { font-size: 1.1rem; font-weight: 800; color: #475569; }
.val-num.is-late { color: #ef4444; }
.center-cell { text-align: center; }

.score-pill { display: inline-block; padding: 4px 12px; border-radius: 8px; font-weight: 900; font-size: 0.85rem; }
.status-badge { font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
.status-badge.success { background: #dcfce7; color: #15803d; }
.status-badge.danger { background: #fee2e2; color: #b91c1c; }

.empty-row { padding: 4rem !important; text-align: center; color: #94a3b8; font-weight: 600; }

.glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); }

@media (max-width: 1024px) {
  .insight-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
}
</style>
