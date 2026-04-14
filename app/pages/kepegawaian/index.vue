<script setup lang="ts">
import { ref, computed } from 'vue'

// @ts-ignore
const { data: statsData, refresh: refreshStats } = await useFetch('/api/kepegawaian/stats')

const refresh = () => refreshStats()

const stats = computed<any>(() => {
  const d = statsData.value as any
  return d?.success ? d.stats : null
})

const { data: activeUsersData } = await useFetch<any>('/api/kepegawaian/stats/active-users')
const activeUsers = computed(() => activeUsersData.value?.success ? activeUsersData.value.data : [])

const { data: tendikExData } = await useFetch<any>('/api/kepegawaian/stats/excellent-tendik')
const tendikEx = computed(() => tendikExData.value?.success ? tendikExData.value.data : { ranking: [], expertise: [] })

const getJafungName = (code: string | number) => {
  const map: any = { 1: 'Asisten Ahli', 2: 'Lektor', 3: 'Lektor Kepala', 4: 'Guru Besar' }
  return map[code] || '-'
}

const getPercent = (val: number, total: number) => {
  if (!total) return 0
  return Math.round((val / total) * 100)
}
</script>

<template>
  <div class="kepegawaian-dashboard">
    <!-- Header Section -->
    <header class="dashboard-header">
      <div class="h-text">
        <h1>Intelligence SDM Command</h1>
        <p>Monitoring Strategis & Manajemen Karir Pegawai UNIKARTA</p>
      </div>
      <button class="glass-button refresh-btn" @click="refresh">
        <span>↻</span> Sinkronisasi Data
      </button>
    </header>

    <div v-if="stats" class="dashboard-content">
      <!-- ROW 1: CORE METRICS -->
      <section class="metrics-grid">
        <div class="glass-card metric-item sdm">
          <div class="m-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="m-data">
            <label>Total SDM Aktif</label>
            <div class="num">{{ stats.total }}</div>
            <div class="m-footer">Dosen: {{ stats.dosen.total }} | Tendik: {{ stats.tendik.total }}</div>
          </div>
        </div>
        
        <div class="glass-card metric-item doctor">
          <div class="m-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          </div>
          <div class="m-data">
            <label>Pencapaian S3 (Doktor)</label>
            <div class="num">{{ stats.matrix.s3Actual }}<span class="sub">/{{ stats.matrix.s3Target }}</span></div>
            <div class="m-progress"><div class="p-fill" :style="{ width: getPercent(stats.matrix.s3Actual, stats.matrix.s3Target) + '%' }"></div></div>
          </div>
        </div>

        <div class="glass-card metric-item master">
          <div class="m-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <div class="m-data">
            <label>Dosen Berpendidikan S2</label>
            <div class="num">{{ stats.matrix.s2Actual }}</div>
            <div class="m-footer">Magister Aktif</div>
          </div>
        </div>

        <div class="glass-card metric-item alert">
          <div class="m-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <div class="m-data">
            <label>Antrian Kenaikan Pangkat</label>
            <div class="num">{{ stats.alerts.length }}</div>
            <div class="m-footer">Dosen siap promosi</div>
          </div>
        </div>

        <div class="glass-card metric-item training">
          <div class="m-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          </div>
          <div class="m-data">
            <label>Pengembangan Tendik</label>
            <div class="num">{{ stats.tendik.trained }}<span class="sub">/{{ stats.tendik.total }}</span></div>
            <div class="m-footer">Telah mengikuti pelatihan</div>
          </div>
        </div>
      </section>

      <!-- ROW 2: DOSEN ANALYTICS -->
      <header class="section-divider">
        <h3>Analisis Strategis & Karir Dosen</h3>
        <span class="line"></span>
      </header>
      <section class="analysis-grid dosen">
        <!-- Academic Rank Distribution -->
        <div class="glass-card analytics-panel">
          <div class="p-header">
            <h3>Sebaran Jabatan Akademik</h3>
          </div>
          <div class="jafung-list">
            <div v-for="(val, key) in stats.dosen.jafung" :key="key" class="j-item">
              <div class="j-text">
                <span class="j-name">{{ String(key).replace('_', ' ').toUpperCase() }}</span>
                <span class="j-count">{{ val }} Orang</span>
              </div>
              <div class="j-bar-bg"><div class="j-bar-fill" :style="{ width: getPercent(Number(val), stats.dosen.total) + '%' }"></div></div>
            </div>
          </div>
        </div>

        <!-- Smart Alerts List (Dosen) -->
        <div class="glass-card alerts-panel">
          <div class="p-header">
            <h3>Peringatan Kenaikan Jabatan</h3>
          </div>
          <div class="alert-scroll">
            <div v-for="alert in stats.alerts" :key="alert.nik" class="alert-card">
              <div class="a-info">
                <span class="a-name">{{ alert.nama_dosen }}</span>
                <span class="a-meta">ID: {{ alert.identitas || '-' }} | {{ getJafungName(alert.id_jafung) }}</span>
              </div>
              <NuxtLink :to="'/kepegawaian/' + alert.nik" class="a-link">Review ↗</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Training Dosen -->
        <div class="glass-card table-panel">
          <div class="p-header">
            <h3>Pengembangan Kompetensi Dosen</h3>
          </div>
          <div class="alert-scroll">
            <div v-for="d in stats.dosen.trainedList" :key="d.nik" class="alert-card">
              <div class="a-info">
                <span class="a-name">{{ d.nama }}</span>
                <span class="a-meta">{{ d.unit || 'Fakultas' }} | NIK: {{ d.nik }}</span>
              </div>
              <NuxtLink :to="'/kepegawaian/' + d.nik" class="a-link">Detail ↗</NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- ROW 3: TENDIK ANALYTICS & EXCELLENCE -->
      <header class="section-divider mt-12">
        <h3>Ekselensi & Analisis Kompetensi Tendik</h3>
        <span class="line"></span>
      </header>
      <section class="analysis-grid tendik-ex-grid">
        <!-- Top 10 Excellent Tendik -->
        <div class="glass-card table-panel">
          <div class="p-header">
            <h3>Top 10 Excellent Tendik</h3>
          </div>
          <div class="alert-scroll">
            <div v-for="(t, idx) in tendikEx.ranking" :key="t.nik" class="alert-card excellence-card">
              <div class="rank-badge">{{ Number(idx) + 1 }}</div>
              <div class="a-info">
                <span class="a-name">{{ t.nama }}</span>
                <span class="a-meta">{{ t.unit || 'Unit Kerja' }} | Score: {{ t.score }} Pts</span>
              </div>
              <div class="score-details" title="Pelatihan | Sertifikasi">
                 {{ t.total_pelatihan }} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                 | {{ t.total_sertifikasi }} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
            </div>
            <div v-if="tendikEx.ranking.length === 0" class="text-center text-muted py-8">Belum ada data kompetensi tendik</div>
          </div>
        </div>

        <!-- Dominant Expertise Analysis -->
        <div class="glass-card analytics-panel">
          <div class="p-header">
            <h3>Peta Keahlian Dominan (Tendik)</h3>
          </div>
          <div class="expertise-viz">
             <div v-for="exp in tendikEx.expertise" :key="exp.name" class="exp-row">
                <div class="exp-label">
                   <span class="exp-name">{{ exp.name }}</span>
                   <span class="exp-val">{{ exp.count }} Personil</span>
                </div>
                <div class="exp-bar-bg">
                   <div class="exp-bar-fill" :style="{ width: (Number(exp.count) / Number(tendikEx.ranking[0]?.score || 10) * 100) + '%' }"></div>
                </div>
             </div>
             <div class="exp-insight">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <p>Data ini menunjukkan fokus pengembangan SDM Tendik. Dominasi pada bidang tertentu membantu penempatan tugas yang lebih presisi.</p>
             </div>
          </div>
        </div>
      </section>

      <!-- ROW 4: DOSEN STRATEGIC PLANNING -->
      <header class="section-divider mt-12">
        <h3>Intelligence: Dosen Strategy & Succession</h3>
        <span class="line"></span>
      </header>
      <section class="analysis-grid intelligence-grid">
        <!-- Retirement Forecast Dosen -->
        <div class="glass-card alerts-panel">
          <div class="p-header">
            <h3>Peta Purna Tugas Dosen</h3>
          </div>
          <div class="alert-scroll">
            <div v-for="r in stats.retirementDosen" :key="r.nik" class="alert-card retirement-card">
              <div class="a-info">
                <span class="a-name">{{ r.nama }}</span>
                <span class="a-meta">NIK: {{ r.nik }} | Sisa {{ r.years_left }} Thn</span>
                <div class="r-bar-bg"><div :class="['r-bar-fill', r.years_left <= 1 ? 'critical' : 'warning']" :style="{ width: (100 - (r.years_left * 20)) + '%' }"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Density Heatmap Dosen -->
        <div class="glass-card heatmap-panel">
          <div class="p-header">
            <h3>Sebaran Dosen (per Prodi)</h3>
          </div>
          <div class="heatmap-container">
            <div v-for="h in stats.heatmapDosen" :key="h.unit" class="heat-box" :style="{ opacity: 0.3 + (h.count / 20), backgroundColor: '#6366f1' }">
              <span class="h-num">{{ h.count }}</span>
              <span class="h-label">{{ h.unit }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ROW 5: TENDIK STRATEGIC PLANNING -->
      <header class="section-divider mt-12">
        <h3>Intelligence: Tendik Planning & Development</h3>
        <span class="line"></span>
      </header>
      <section class="analysis-grid intelligence-grid">
        <!-- Retirement Forecast Tendik -->
        <div class="glass-card alerts-panel">
          <div class="p-header">
            <h3>Peta Purna Tugas Tendik</h3>
          </div>
          <div class="alert-scroll">
            <div v-for="r in stats.retirementTendik" :key="r.nik" class="alert-card retirement-card tendik-border">
              <div class="a-info">
                <span class="a-name">{{ r.nama }}</span>
                <span class="a-meta">NIK: {{ r.nik }} | Sisa {{ r.years_left }} Thn</span>
                <div class="r-bar-bg"><div :class="['r-bar-fill', r.years_left <= 1 ? 'critical' : 'warning']" :style="{ width: (100 - (r.years_left * 20)) + '%' }"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Density Heatmap Tendik -->
        <div class="glass-card heatmap-panel">
          <div class="p-header">
            <h3>Sebaran Tendik (per Biro)</h3>
          </div>
          <div class="heatmap-container">
            <div v-for="h in stats.heatmapTendik" :key="h.unit" class="heat-box" :style="{ opacity: 0.3 + (h.count / 20), backgroundColor: '#10b981' }">
              <span class="h-num">{{ h.count }}</span>
              <span class="h-label">{{ h.unit }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ROW 6: STRATEGIC DECISION SUPPORT -->
      <ClientOnly>
        <KepegawaianStrategicIntelligence :stats="stats" />
      </ClientOnly>

      <!-- ROW 7: TOP ACTIVE USERS -->
      <header class="section-divider mt-12">
        <h3>Peringkat Aktivitas Operator Prodi</h3>
        <span class="line"></span>
      </header>
      <section class="analysis-grid active-users-grid">
         <div class="glass-card active-users-panel">
            <div class="p-header">
                <h3>Top 5 User Prodi Teraktif</h3>
            </div>
            <div class="active-users-list">
                <div v-for="(user, idx) in activeUsers" :key="user.username" class="user-rank-card">
                    <div class="rank-num">{{ Number(idx) + 1 }}</div>
                    <div class="user-avatar">{{ user.name[0] }}</div>
                    <div class="user-info">
                        <span class="u-name">{{ user.name }}</span>
                        <span class="u-unit">{{ user.unit_name || 'Unit Kerja' }}</span>
                    </div>
                    <div class="activity-metric">
                        <span class="count">{{ user.activity_count }}</span>
                        <span class="label">Aksi</span>
                    </div>
                </div>
                <div v-if="activeUsers.length === 0" class="empty-stats">Belum ada aktivitas tercatat dari user prodi.</div>
            </div>
         </div>
         
         <div class="glass-card summary-panel">
            <div class="p-header">
                <h3>Kinerja Administratif</h3>
            </div>
            <div class="summary-body">
                <p class="summary-desc">Penilaian ini didasarkan pada akumulasi log aktivitas sistem secara real-time. Setiap penambahan, pembaruan, and validasi berkas oleh operator unit dihitung sebagai satu poin kontribusi aktif terhadap validitas data pangkalan SDM.</p>
                <div class="summary-visual">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
                </div>
            </div>
         </div>
      </section>

      <!-- ROW 7: QUICK ACTIONS -->
      <header class="section-divider mt-12">
        <h3>Akses Cepat Manajemen</h3>
        <span class="line"></span>
      </header>
      <section class="action-grid">
        <NuxtLink to="/kepegawaian/dosen" class="glass-card action-item">
          <span class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></span> <h3>Kelola Dosen</h3>
        </NuxtLink>
        <NuxtLink to="/kepegawaian/tendik" class="glass-card action-item">
          <span class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span> <h3>Kelola Tendik</h3>
        </NuxtLink>
        <NuxtLink to="/kepegawaian/berkas" class="glass-card action-item">
          <span class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></span> <h3>Digital Dossier</h3>
        </NuxtLink>
        <NuxtLink to="/kepegawaian/laporan" class="glass-card action-item">
          <span class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></span> <h3>Export Laporan</h3>
        </NuxtLink>
      </section>
    </div>
  </div>
</template>

<style scoped>
.kepegawaian-dashboard { padding: 1rem 0 5rem; max-width: 1400px; margin: 0 auto; }

.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.h-text h1 { font-size: 2.5rem; font-weight: 900; background: linear-gradient(135deg, #1e293b 0%, #6366f1 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
.h-text p { color: var(--text-muted); font-size: 1.1rem; font-weight: 500; }

.refresh-btn { background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 0.6rem 1.2rem; transform: translateY(-10px); }

/* Row 1 Metrics */
.metrics-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.metric-item { display: flex; align-items: center; gap: 1.5rem; padding: 2rem; }
.m-icon { 
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.3)); 
}
.m-icon svg { width: 100%; height: 100%; }
.m-data label { font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.1em; }
.m-data .num { font-size: 2.5rem; font-weight: 900; margin: 0.2rem 0; color: #1e293b; }
.num .sub { font-size: 1.2rem; color: var(--text-muted); opacity: 0.8; }
.m-footer { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }

.m-progress { height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; width: 100%; margin-top: 0.5rem; overflow: hidden; }
.p-fill { height: 100%; background: var(--primary); border-radius: 3px; }

/* Row 2 Grid */
.section-divider { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
.section-divider h3 { font-size: 0.85rem; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 0.15em; white-space: nowrap; }
.section-divider .line { height: 1px; flex: 1; background: linear-gradient(to right, rgba(99, 102, 241, 0.2), transparent); }

.analysis-grid { display: grid; gap: 1.5rem; margin-bottom: 2.5rem; }
.analysis-grid.dosen { grid-template-columns: 1fr 1fr 1fr; align-items: stretch; }
.analysis-grid.tendik { grid-template-columns: 1fr; }
.analysis-grid.intelligence-grid { grid-template-columns: 0.8fr 1.2fr; align-items: stretch; }

.glass-card { display: flex; flex-direction: column; }
.glass-card > div:last-child { flex: 1; } /* Make the content area grow */

.list-container, .alert-scroll, .jafung-list { 
  max-height: 420px; 
  overflow-y: auto; 
  padding: 0.5rem 1rem 2rem 0.5rem; /* Added bottom padding (2rem) */
  scrollbar-width: thin;
}

.list-container::-webkit-scrollbar, .alert-scroll::-webkit-scrollbar { width: 4px; }
.list-container::-webkit-scrollbar-thumb, .alert-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

.heatmap-panel { padding: 2rem; }
.heatmap-container { display: flex; flex-wrap: wrap; gap: 0.75rem; max-height: 400px; overflow-y: auto; }
.heat-box { 
  flex: 1 1 110px; 
  min-height: 80px; 
  padding: 1rem; 
  border-radius: 12px; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  color: white; 
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1);
}
.heat-box:hover { transform: scale(1.05); z-index: 10; font-weight: bold; }
.h-num { font-size: 1.5rem; font-weight: 900; }
.h-label { font-size: 0.6rem; text-transform: uppercase; text-align: center; margin-top: 0.25rem; font-weight: 700; opacity: 0.9; line-height: 1.2; }
.min-w-300 { min-width: 320px; }

.retirement-card { border-left: 4px solid #f59e0b; }
.retirement-card:has(.critical) { border-left-color: #ef4444; }
.type-badge { background: #f1f5f9; color: #475569; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.65rem; font-weight: 800; }

.retirement-prog { margin-top: 0.75rem; }
.retirement-prog label { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
.r-bar-bg { height: 4px; background: #f1f5f9; border-radius: 2px; margin-top: 0.3rem; overflow: hidden; }
.r-bar-fill { height: 100%; transition: all 0.5s; }
.r-bar-fill.warning { background: #f59e0b; }
.r-bar-fill.critical { background: #ef4444; }

.mt-12 { margin-top: 4rem; }
.analytics-panel, .alerts-panel, .table-panel, .heatmap-panel { padding: 2rem; }
.p-header h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 2rem; color: #1e293b; position: relative; padding-left: 1rem; }
.p-header h3::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--primary); border-radius: 2px; }

.jafung-list { display: flex; flex-direction: column; gap: 1.5rem; }
.j-text { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.j-name { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); }
.j-count { font-size: 0.9rem; font-weight: 800; }
.j-bar-bg { height: 6px; background: rgba(255,255,255,0.03); border-radius: 3px; }
.j-bar-fill { height: 100%; background: var(--primary); border-radius: 3px; box-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }

.alert-scroll { display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto; padding-right: 0.5rem; }
.alert-card { 
  background: rgba(255,255,255,0.4); 
  border: 1px solid rgba(99, 102, 241, 0.1); 
  padding: 1.25rem; 
  border-radius: 16px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  transition: all 0.3s ease;
  margin-bottom: 0.75rem; /* Added margin between cards */
}
.alert-card:last-child { margin-bottom: 0; }
.alert-card:hover { border-color: rgba(99, 102, 241, 0.4); background: rgba(255,255,255,0.8); box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.a-name { display: block; font-weight: 800; font-size: 0.95rem; line-height: 1.2; margin-bottom: 0.2rem; color: #1e293b; }
.a-meta { font-size: 0.75rem; color: var(--text-muted); display: block; font-weight: 600; }
.a-link { color: var(--primary); text-decoration: none; font-weight: 700; font-size: 0.8rem; padding: 0.4rem 0.8rem; background: rgba(99,102,241,0.08); border-radius: 8px; }

/* Row 3 Grid */
.action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.action-item { padding: 1.5rem; display: flex; align-items: center; gap: 1rem; text-decoration: none; color: #1e293b; transition: 0.3s; }
.action-item:hover { transform: translateY(-3px); border-color: var(--primary); box-shadow: var(--card-shadow); background: white; }
.action-item .i { 
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  opacity: 0.8;
}
.action-item .i svg { width: 100%; height: 100%; }
.action-item h3 { font-size: 1rem; font-weight: 800; }

/* Custom Scrollbar */
.alert-scroll::-webkit-scrollbar { width: 4px; }
.alert-scroll::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 2px; }

.list-item-card.mini { padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid #f1f5f9; background: #f8fafc; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; }
.li-link { color: #6366f1; text-decoration: none; font-weight: bold; font-size: 1.1rem; transition: all 0.2s; }
.li-link:hover { transform: translateX(3px); }
.li-name { font-weight: 700; font-size: 0.85rem; color: #1e293b; display: block; }
.li-unit { font-size: 0.7rem; color: #64748b; font-weight: 600; }

.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
/* Active Users Styles */
.active-users-grid { grid-template-columns: 1.2fr 0.8fr; }
.active-users-panel { padding: 2rem; }
.active-users-list { display: flex; flex-direction: column; gap: 1rem; }
.user-rank-card { 
  display: flex; align-items: center; gap: 1.5rem; background: #f8fafc; padding: 1rem 1.5rem; border-radius: 20px; 
  border: 1px solid #f1f5f9; transition: all 0.3s;
}
.user-rank-card:hover { transform: translateX(10px); background: white; border-color: var(--primary); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

.rank-num { font-size: 1.5rem; font-weight: 900; color: #cbd5e1; width: 30px; }
.user-rank-card:nth-child(1) .rank-num { color: #f59e0b; }
.user-rank-card:nth-child(2) .rank-num { color: #94a3b8; }
.user-rank-card:nth-child(3) .rank-num { color: #b45309; }

.user-avatar { width: 45px; height: 45px; background: #4f46e5; color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2); }
.user-info { flex: 1; }
.u-name { display: block; font-weight: 800; color: #1e293b; font-size: 1rem; }
.u-unit { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; }

.activity-metric { text-align: right; }
.activity-metric .count { display: block; font-size: 1.5rem; font-weight: 900; color: #4f46e5; line-height: 1; }
.activity-metric .label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }

.summary-panel { padding: 2rem; }
.summary-desc { font-size: 14px; color: #64748b; line-height: 1.6; font-weight: 600; margin-bottom: 2rem; }
.summary-visual { width: 80px; height: 80px; background: #eef2ff; color: #4f46e5; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-top: auto; }
.summary-visual svg { width: 40px; height: 40px; }
.empty-stats { padding: 3rem; text-align: center; color: #94a3b8; font-weight: 700; }

/* Tendik Excellence Styles */
.tendik-ex-grid { grid-template-columns: 1fr 1fr; }
.excellence-card { position: relative; padding-left: 3.5rem; }
.rank-badge { 
  position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); 
  width: 28px; height: 28px; background: #f1f5f9; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; color: #64748b; font-size: 0.9rem;
}
.excellence-card:nth-child(1) .rank-badge { background: #fef3c7; color: #d97706; }
.excellence-card:nth-child(2) .rank-badge { background: #f1f5f9; color: #475569; }
.excellence-card:nth-child(3) .rank-badge { background: #ffedd5; color: #9a3412; }

.score-details { font-size: 0.75rem; font-weight: 800; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
.mini-icon { width: 12px; height: 12px; opacity: 0.6; }

.expertise-viz { display: flex; flex-direction: column; gap: 1.5rem; }
.exp-row { width: 100%; }
.exp-label { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.exp-name { font-weight: 800; color: #334155; font-size: 0.9rem; }
.exp-val { font-size: 0.75rem; font-weight: 700; color: #94a3b8; }
.exp-bar-bg { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.exp-bar-fill { height: 100%; background: linear-gradient(to right, #6366f1, #a855f7); border-radius: 4px; }

.exp-insight { 
  margin-top: 2rem; padding: 1.25rem; background: #f8fafc; border-radius: 16px; border-left: 4px solid #6366f1;
  display: flex; gap: 12px; align-items: flex-start;
}
.exp-insight svg { width: 20px; height: 20px; color: #6366f1; flex-shrink: 0; margin-top: 2px; }
.exp-insight p { font-size: 13px; color: #64748b; line-height: 1.6; font-weight: 600; margin: 0; }

@media (max-width: 1024px) {
  .analysis-grid.dosen, .grid-2-col, .analysis-grid.intelligence-grid, .active-users-grid, .tendik-ex-grid { grid-template-columns: 1fr; }
}
</style>
