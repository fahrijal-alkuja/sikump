<script setup lang="ts">
import { ref, computed } from 'vue'

const { data: analyticsData, refresh } = await useFetch<any>('/api/kepegawaian/survei/analytics')

const stats = computed(() => analyticsData.value?.success ? analyticsData.value.stats : null)

const getScoreColor = (score: number) => {
  if (score >= 3.5) return '#10b981' // Excellent
  if (score >= 3.0) return '#6366f1' // Good
  if (score >= 2.5) return '#f59e0b' // Fair
  return '#ef4444' // Poor
}

const getScoreLabel = (score: number) => {
  if (score >= 3.5) return 'Sangat Puas'
  if (score >= 3.0) return 'Puas'
  if (score >= 2.5) return 'Cukup Puas'
  return 'Kurang Puas'
}
</script>

<template>
  <div class="analytics-page">
    <div class="analytics-container">
      <header class="page-header">
        <div class="h-left">
          <h1>Analisis Hasil Survei Tendik</h1>
          <p>Visualisasi kepuasan tenaga kependidikan terhadap layanan institusi.</p>
        </div>
        <button class="glass-button refresh-btn" @click="() => refresh()">
          <span>↻</span> Update Data
        </button>
      </header>

      <div v-if="stats" class="stats-content">
        <!-- Core Summary -->
        <section class="summary-grid">
          <div class="glass-card summary-item">
            <div class="s-icon">👥</div>
            <div class="s-data">
              <label>Total Responden</label>
              <div class="num">{{ stats.total_responden }}</div>
              <p>Partisipasi Tendik Aktif</p>
            </div>
          </div>

          <div v-for="(val, key) in stats.scores" :key="key" class="glass-card score-item">
            <div class="score-radial" :style="{ '--score-color': getScoreColor(val) }">
              <span class="score-val">{{ val }}</span>
              <span class="score-max">/ 4.0</span>
            </div>
            <div class="score-info">
              <label>{{ String(key).replace('_', ' ').toUpperCase() }}</label>
              <div class="score-label" :style="{ color: getScoreColor(val) }">{{ getScoreLabel(val) }}</div>
            </div>
          </div>
        </section>

        <!-- Trend Chart Section -->
        <section class="glass-card trend-panel mb-8">
          <div class="section-header">
            <h3>Tren Tingkat Kepuasan (5 Tahun Terakhir)</h3>
            <p>Visualisasi konsistensi layanan sesuai standar PPEPP BAN-PT.</p>
          </div>
          <div class="trend-chart">
            <div v-for="t in stats.trend" :key="t.year" class="trend-bar-group">
               <div class="t-bar-container">
                  <div class="t-bar-fill" :style="{ height: (t.score / 4 * 100) + '%', backgroundColor: getScoreColor(t.score) }">
                    <span class="t-score-tooltip">{{ t.score }}</span>
                  </div>
               </div>
               <div class="t-meta">
                  <span class="t-year">{{ t.year }}</span>
                  <span class="t-count">{{ t.count }} Respon</span>
               </div>
            </div>
          </div>
        </section>

        <div class="dashboard-grid">
          <!-- AI Intelligence Section (New) -->
          <div v-if="stats.ai_insight" class="glass-card ai-insight-panel mb-8">
            <div class="ai-header">
              <span class="ai-sparkle">✨</span>
              <h3>Strategic AI Intelligence</h3>
              <div class="ai-badge">ANALYZED BY GEMINI FLASH</div>
            </div>

            <!-- Error State for AI -->
            <div v-if="stats.ai_insight.error" class="ai-error-state">
              <div class="ai-error-icon">⚠️</div>
              <p>{{ stats.ai_insight.error }}</p>
            </div>
            
            <div v-else class="ai-content-grid">
              <div class="ai-main-conclusion">
                <h4>Kesimpulan Eksekutif</h4>
                <p>{{ stats.ai_insight.kesimpulan }}</p>
                
                <div class="ai-recommendations mt-6">
                  <h5>Rekomendasi Strategis:</h5>
                  <ul>
                    <li v-for="(s, idx) in stats.ai_insight.saran" :key="idx">{{ s }}</li>
                  </ul>
                </div>
              </div>
              
              <div class="ai-criteria-narratives">
                <h4>Narasi per Kriteria</h4>
                <div class="criteria-list">
                  <div v-for="(narrative, key) in stats.ai_insight.per_kriteria" :key="key" class="criteria-narrative-item">
                     <div class="c-label-group">
                        <span class="c-dot"></span>
                        <label>{{ String(key).replace('_', ' ').toUpperCase() }}</label>
                     </div>
                     <p>{{ narrative }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="dist-feedback-layout">
            <!-- Distributions -->
            <div class="glass-card distribution-panel">
              <h3>Sebaran Responden per Unit</h3>
              <div class="dist-list">
                <div v-for="(count, unit) in stats.distribution.unit" :key="unit" class="dist-row">
                  <div class="dist-label">
                    <span>{{ unit }}</span>
                    <span>{{ count }} Respon</span>
                  </div>
                  <div class="dist-bar-bg">
                    <div class="dist-bar-fill" :style="{ width: (count / stats.total_responden * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Feedback -->
            <div class="glass-card feedback-panel">
              <h3>Feedback Terbaru</h3>
              <div class="feedback-scroll">
                <div v-for="(f, idx) in stats.recent_feedback" :key="idx" class="f-card">
                  <div class="f-header">
                    <span class="f-unit">{{ f.unit }}</span>
                    <span class="f-date">{{ new Date(f.date).toLocaleDateString() }}</span>
                  </div>
                  <div class="f-body">
                    <div class="f-item">
                      <label>Memuaskan:</label>
                      <p>{{ f.memuaskan }}</p>
                    </div>
                    <div class="f-item">
                      <label>Saran:</label>
                      <p>{{ f.saran }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state glass-card">
        <div class="empty-icon">📊</div>
        <h2>Belum Ada Data Survei</h2>
        <p>Data analisis akan muncul setelah ada tendik yang mengisi formulir survei.</p>
        <NuxtLink to="/kepegawaian/survei/tendik" class="btn-primary">Buka Link Survei</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-page { min-height: 100vh; background: #f1f5f9; padding: 2rem 1rem; }
.analytics-container { max-width: 1300px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
.page-header h1 { font-size: 2.2rem; font-weight: 900; color: #1e293b; margin-bottom: 0.5rem; }
.page-header p { color: #64748b; font-size: 1.1rem; }

.summary-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.glass-card { padding: 1.5rem; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255,255,255,0.7); background: rgba(255,255,255,0.8); }

.mb-8 { margin-bottom: 2rem; }
.trend-panel { padding: 2.5rem; }
.section-header { margin-bottom: 2rem; }
.section-header h3 { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
.section-header p { font-size: 0.9rem; color: #64748b; font-weight: 600; }

.trend-chart { display: flex; justify-content: space-around; align-items: flex-end; height: 300px; padding-top: 2rem; }
.trend-bar-group { display: flex; flex-direction: column; align-items: center; gap: 1rem; flex: 1; }
.t-bar-container { height: 200px; width: 40px; background: #f1f5f9; border-radius: 12px; position: relative; display: flex; align-items: flex-end; }
.t-bar-fill { width: 100%; border-radius: 8px; transition: all 1s ease-out; position: relative; }
.t-score-tooltip { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: #1e293b; color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; opacity: 0; transition: 0.3s; }
.t-bar-group:hover .t-score-tooltip { opacity: 1; top: -35px; }

.t-meta { text-align: center; }
.t-year { display: block; font-weight: 900; color: #1e293b; font-size: 1rem; }
.t-count { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

.summary-item { background: #4f46e5; color: white; display: flex; align-items: center; gap: 1rem; }
.s-icon { font-size: 2.5rem; opacity: 0.8; }
.s-data label { font-size: 0.7rem; text-transform: uppercase; font-weight: 800; opacity: 0.8; }
.s-data .num { font-size: 2rem; font-weight: 950; line-height: 1; margin: 4px 0; }
.s-data p { font-size: 0.75rem; font-weight: 600; opacity: 0.7; }

.score-item { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; background: white; }
.score-radial { width: 80px; height: 80px; border-radius: 50%; border: 6px solid var(--score-color); display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.02); }
.score-val { font-size: 1.5rem; font-weight: 900; line-height: 1; color: #1e293b; }
.score-max { font-size: 0.6rem; font-weight: 700; color: #94a3b8; }
.score-info label { font-size: 0.65rem; font-weight: 900; color: #64748b; display: block; margin-bottom: 4px; }
.score-label { font-size: 0.85rem; font-weight: 800; }

.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

.distribution-panel h3, .feedback-panel h3 { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem; }

.dist-list { display: flex; flex-direction: column; gap: 1.25rem; }
.dist-row { width: 100%; }
.dist-label { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 6px; }
.dist-bar-bg { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.dist-bar-fill { height: 100%; background: #4f46e5; border-radius: 4px; }

.feedback-scroll { display: flex; flex-direction: column; gap: 1rem; max-height: 500px; overflow-y: auto; padding-right: 0.5rem; }
.f-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 16px; }
.f-header { display: flex; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px dashed #cbd5e1; }
.f-unit { font-weight: 800; color: #4f46e5; font-size: 0.85rem; }
.f-date { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.f-item { margin-bottom: 0.75rem; }
.f-item label { font-size: 0.75rem; font-weight: 800; color: #64748b; display: block; margin-bottom: 4px; }
.f-item p { font-size: 0.9rem; line-height: 1.5; color: #334155; margin: 0; }

.empty-state { text-align: center; padding: 5rem; background: white; margin-top: 2rem; }
.empty-icon { font-size: 4rem; margin-bottom: 1.5rem; }
.empty-state h2 { font-size: 1.8rem; font-weight: 900; margin-bottom: 1rem; }
.empty-state p { color: #64748b; margin-bottom: 2rem; }

.btn-primary { display: inline-block; background: #4f46e5; color: white; padding: 0.75rem 2rem; border-radius: 12px; font-weight: 700; text-decoration: none; transition: 0.3s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2); }

.ai-insight-panel { background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95)); border: 1px solid rgba(79, 70, 229, 0.2); grid-column: span 2; }
.ai-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
.ai-sparkle { font-size: 1.5rem; }
.ai-header h3 { font-size: 1.4rem; font-weight: 950; color: #1e293b; margin: 0; }
.ai-badge { background: #4f46e5; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 900; letter-spacing: 1px; margin-left: auto; }
.ai-error-state { display: flex; align-items: center; gap: 1rem; padding: 2rem; background: rgba(245, 158, 11, 0.05); border-radius: 16px; border: 1px dashed rgba(245, 158, 11, 0.3); margin-top: 1rem; }
.ai-error-icon { font-size: 1.5rem; }
.ai-error-state p { color: #b45309; font-weight: 700; font-size: 0.95rem; margin: 0; }

.ai-content-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 3rem; }
.ai-main-conclusion h4 { font-size: 1.1rem; font-weight: 900; color: #4f46e5; margin-bottom: 1rem; }
.ai-main-conclusion p { font-size: 1rem; line-height: 1.7; color: #334155; font-weight: 500; font-style: italic; opacity: 0.9; }

.ai-recommendations h5 { font-size: 0.9rem; font-weight: 800; color: #1e293b; margin: 1.5rem 0 0.75rem; }
.ai-recommendations ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.ai-recommendations li { padding-left: 1.5rem; position: relative; font-size: 0.9rem; font-weight: 600; color: #475569; }
.ai-recommendations li::before { content: "→"; position: absolute; left: 0; color: #4f46e5; font-weight: 900; }

.ai-criteria-narratives h4 { font-size: 1.1rem; font-weight: 900; color: #1e293b; margin-bottom: 1.5rem; }
.criteria-list { display: flex; flex-direction: column; gap: 1.25rem; }
.criteria-narrative-item { background: white; padding: 1.25rem; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
.c-label-group { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
.c-dot { width: 8px; height: 8px; background: #4f46e5; border-radius: 50%; }
.c-label-group label { font-size: 0.75rem; font-weight: 900; color: #64748b; letter-spacing: 0.5px; }
.criteria-narrative-item p { font-size: 0.9rem; line-height: 1.6; color: #475569; margin: 0; font-weight: 500; }

.dist-feedback-layout { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

@media (max-width: 1000px) {
  .ai-content-grid { grid-template-columns: 1fr; gap: 2rem; }
  .dist-feedback-layout { grid-template-columns: 1fr; }
}
</style>
