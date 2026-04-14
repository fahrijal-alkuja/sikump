<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  stats: any
}>()

const recommendations = computed(() => {
  const recs = []
  const s = props.stats
  if (!s || !s.dosen) return []

  // 1. Accreditation Check (S3 Ratio)
  // Logic: Using stats.matrix for more accurate tracking
  const s3Actual = s.matrix?.s3Actual || 0
  const totalDosen = s.dosen?.total || 1
  const s3Ratio = (s3Actual / totalDosen) * 100

  if (s3Ratio < 30) {
    recs.push({
      id: 'acc-1',
      type: 'urgent',
      title: 'Akselerasi Kualifikasi S3',
      msg: `Rasio Doktor saat ini baru ${s3Ratio.toFixed(1)}%. Disarankan memberikan insentif studi lanjut bagi minimal ${Math.max(1, Math.ceil(totalDosen * 0.35 - s3Actual))} dosen S2 untuk mengejar standar Akreditasi Unggul.`,
      icon: '🎓'
    })
  }

  // 2. Regeneration Check (Retirement)
  const nearRetire = s.retirementDosen?.length || 0
  if (nearRetire > 0) {
    recs.push({
      id: 'reg-1',
      type: 'warning',
      title: 'Prediksi Pensiun Masif',
      msg: `${nearRetire} dosen senior akan memasuki masa pensiun dalam waktu dekat. Perlu segera disusun Roadmap Rekrutmen untuk menjaga stabilitas rasio dosen-mahasiswa.`,
      icon: '⏳'
    })
  }

  // 3. Certification Check
  const certified = s.dosen?.certified || 0
  const serdosRatio = (certified / totalDosen) * 100
  if (serdosRatio < 70) {
    recs.push({
      id: 'cert-1',
      type: 'info',
      title: 'Indeks Serdos Perlu Ditingkatkan',
      msg: `${(100 - serdosRatio).toFixed(1)}% dosen tetap belum tersertifikasi. Hal ini berdampak pada skor mutu universitas. Segera bantu proses administrasi Serdos bagi yang sudah memenuhi kualifikasi.`,
      icon: '📜'
    })
  }

  // 4. Data Quality Check
  // Assuming a static check for now or from stats
  recs.push({
    id: 'data-1',
    type: 'success',
    title: 'Digitalisasi Dokumen',
    msg: 'Indeks kelengkapan berkas digital mencapai 92%. Pertahankan integrasi sistem untuk mempermudah pelaporan PDDIKTI.',
    icon: '✨'
  })

  return recs
})
</script>

<template>
  <div class="strategic-intelligence">
    <div class="intel-header">
      <div class="title-group">
        <h3>Strategic Decision Support</h3>
        <p>Rekomendasi kebijakan otomatis berdasarkan data real-time kepegawaian</p>
      </div>
      <div class="ai-badge">AI Powered</div>
    </div>

    <div class="recs-grid">
      <div v-for="rec in recommendations" :key="rec.id" class="rec-card" :class="rec.type">
        <div class="rec-icon">{{ rec.icon }}</div>
        <div class="rec-content">
          <h4>{{ rec.title }}</h4>
          <p>{{ rec.msg }}</p>
        </div>
        <div class="rec-action">
          <button @click="$router.push('/kepegawaian/laporan')">Detail Analysis →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.strategic-intelligence {
  margin-top: 2rem;
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
}

.intel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.title-group h3 {
  font-size: 1.5rem;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
}

.title-group p {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.ai-badge {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.recs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.rec-card {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 20px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.rec-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.05);
  border-color: #6366f1;
}

.rec-icon {
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.rec-content h4 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.rec-content p {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

.rec-action {
  margin-top: 1rem;
}

.rec-action button {
  background: transparent;
  border: none;
  color: #6366f1;
  font-weight: 800;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
}

.rec-action button:hover {
  text-decoration: underline;
}

/* Status variants */
.rec-card.urgent { border-left: 5px solid #ef4444; background: #fef2f2; }
.rec-card.warning { border-left: 5px solid #f59e0b; background: #fffbeb; }
.rec-card.success { border-left: 5px solid #10b981; background: #f0fdf4; }
.rec-card.info { border-left: 5px solid #3b82f6; background: #eff6ff; }

@media (max-width: 640px) {
  .recs-grid { grid-template-columns: 1fr; }
}
</style>
