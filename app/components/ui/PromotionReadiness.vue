<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  employee: any
}>()

const rankHierarchy = [
  { id: '1', name: 'Asisten Ahli', next: 'Lektor' },
  { id: '2', name: 'Lektor', next: 'Lektor Kepala' },
  { id: '3', name: 'Lektor Kepala', next: 'Guru Besar' },
  { id: '4', name: 'Guru Besar', next: null }
]

const promotionData = computed(() => {
  const e = props.employee
  if (!e.riwayat_jafung || e.riwayat_jafung.length === 0) return null

  // Sort to get the latest rank
  const latestRank = [...e.riwayat_jafung].sort((a, b) => {
    return new Date(b.tmt).getTime() - new Date(a.tmt).getTime()
  })[0]

  if (!latestRank || !latestRank.tmt) return null

  const tmtDate = new Date(latestRank.tmt)
  const now = new Date()
  
  // Calculate difference in months
  const monthsDiff = (now.getFullYear() - tmtDate.getFullYear()) * 12 + (now.getMonth() - tmtDate.getMonth())
  const targetMonths = 24 // 2 years
  
  const percentage = Math.min(Math.round((monthsDiff / targetMonths) * 100), 100)
  
  // Find current and next rank name
  const currentRankInfo = rankHierarchy.find(r => r.id == e.kode_jabatan_akademik) || { name: 'Tenaga Pengajar', next: 'Asisten Ahli' }
  
  return {
    currentRank: currentRankInfo.name,
    nextRank: currentRankInfo.next,
    tmt: latestRank.tmt,
    monthsServed: monthsDiff,
    percentage,
    isReady: percentage >= 100
  }
})
</script>

<template>
  <div v-if="promotionData" class="promotion-readiness glass-card mb-12">
    <div class="readiness-header">
      <div class="title-info">
        <h3>Promotion Readiness Tracker</h3>
        <p class="text-muted text-xs">Analisis waktu minimum kenaikan Jabatan Akademik (2 Tahun)</p>
      </div>
      <div class="status-badge" :class="{ 'ready': promotionData.isReady }">
        {{ promotionData.isReady ? 'READY FOR PROMOTION' : 'WAITING PERIOD' }}
      </div>
    </div>

    <div class="readiness-body">
      <div class="rank-step">
        <div class="rank-box current">
          <span class="rank-label">Current</span>
          <span class="rank-name">{{ promotionData.currentRank }}</span>
        </div>
        <div class="progression-line">
           <div class="line-inner" :style="{ width: promotionData.percentage + '%' }"></div>
           <span class="percentage-overlay">{{ promotionData.percentage }}%</span>
        </div>
        <div class="rank-box next" v-if="promotionData.nextRank">
          <span class="rank-label">Target Next</span>
          <span class="rank-name">{{ promotionData.nextRank }}</span>
        </div>
      </div>
    </div>

    <div class="readiness-footer">
      <div class="time-stats">
        <div class="stat-item">
          <label>Mulai Menjabat (TMT)</label>
          <span>{{ new Date(promotionData.tmt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}</span>
        </div>
        <div class="stat-item">
          <label>Masa Kerja Berlalu</label>
          <span>{{ promotionData.monthsServed }} Bulan</span>
        </div>
      </div>

      <div v-if="promotionData.isReady" class="ready-announcement">
        🎉 <strong>Siap Diusulkan!</strong> Dosen ini telah memenuhi syarat masa kerja 2 tahun. Silakan persiapkan berkas usulan ke <strong>{{ promotionData.nextRank }}</strong>.
      </div>
      <div v-else-if="promotionData.nextRank" class="waiting-instruction">
        ⏳ Membutuhkan sekitar <strong>{{ 24 - promotionData.monthsServed }} bulan</strong> lagi untuk pengusulan kenaikan pangkat berikutnya.
      </div>
    </div>
  </div>
</template>

<style scoped>
.promotion-readiness { 
  border: 1px solid var(--glass-border); 
  padding: 2.5rem 3rem;
}
.readiness-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
h3 { font-size: 1.25rem; font-weight: 900; color: #1e293b; margin-bottom: 0.5rem; }

.status-badge { font-size: 0.7rem; font-weight: 800; padding: 0.4rem 1rem; border-radius: 20px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
.status-badge.ready { background: #ecfdf5; color: #10b981; border-color: #a7f3d0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1); }

.readiness-body { margin-bottom: 2rem; }
.rank-step { display: flex; align-items: center; gap: 1.5rem; }

.rank-box { flex: 1; padding: 1.25rem; border-radius: 14px; background: white; border: 1px solid var(--glass-border); display: flex; flex-direction: column; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.rank-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 0.4rem; letter-spacing: 0.05em; }
.rank-name { font-size: 1rem; font-weight: 900; color: #1e293b; }

.progression-line { flex: 2; height: 16px; background: #f1f5f9; border-radius: 8px; position: relative; overflow: hidden; border: 4px solid white; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
.line-inner { height: 100%; background: linear-gradient(90deg, var(--primary), #818cf8); transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); }
.percentage-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.65rem; font-weight: 900; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }

.time-stats { display: flex; gap: 3rem; margin-bottom: 1.5rem; padding: 1.25rem; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; }
.stat-item label { display: block; font-size: 0.7rem; color: #64748b; font-weight: 800; text-transform: uppercase; margin-bottom: 0.4rem; }
.stat-item span { font-weight: 900; font-size: 1rem; color: var(--primary); }

.ready-announcement { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; padding: 1rem; border-radius: 10px; font-size: 0.85rem; line-height: 1.5; }
.waiting-instruction { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 1rem; border-radius: 10px; font-size: 0.85rem; }
</style>
