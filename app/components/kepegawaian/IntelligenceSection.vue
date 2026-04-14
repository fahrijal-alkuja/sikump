<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  employee: any
}>()

// --- FETCH REFERENCE DATA ---
// @ts-ignore
const { data: biroStore } = await useFetch<any>('/api/kepegawaian/biro')
const { data: prodiStore } = await useFetch<any>('/api/kepegawaian/prodi')
const { data: eduStore } = await useFetch<any>('/api/kepegawaian/riwayat/pendidikan/levels')

const biroData = computed(() => biroStore.value?.data || [])
const prodiData = computed(() => prodiStore.value?.data || [])
const eduLevels = computed(() => eduStore.value?.data || [])

const getBiroName = (id: string | number) => {
  if (!id) return '-'
  const searchId = String(id).trim()
  
  // Try Biro first
  if (biroData.value && biroData.value.length > 0) {
    const b = biroData.value.find((x: any) => String(x.id).trim() === searchId)
    if (b) return b.nama
  }
  
  // Try Prodi next
  if (prodiData.value && prodiData.value.length > 0) {
    const p = prodiData.value.find((x: any) => String(x.id).trim() === searchId)
    if (p) return p.nama
  }

  return id
}

// --- HELPER: ROBUST DATE PARSING ---
const getYear = (dateInput: any) => {
  if (!dateInput) return '-'
  // Try direct date
  const d = new Date(dateInput)
  if (!isNaN(d.getFullYear())) return d.getFullYear()
  
  // Try regex for 4 digits (year) if string
  const yearMatch = String(dateInput).match(/\d{4}/)
  return yearMatch ? yearMatch[0] : '-'
}

// --- LOGIC: CAREER TIMELINE ---
const timelineEvents = computed(() => {
  const events: any[] = []
  
  // 1. Pendidikan
  props.employee.riwayat_pendidikan?.forEach((edu: any) => {
    const levelId = String(edu.id_pendidikan).trim()
    const levelObj = eduLevels.value.find((l: any) => String(l.id).trim() === levelId)
    const levelName = levelObj ? levelObj.nama_jenjang : 'Pendidikan'
    
    // Icon logic: School for SD/SMP/SMA, Cap for others
    const isSchool = ['1','2','3','8','9','10'].includes(levelId)
    
    events.push({
      date: edu.tahun_lulus || '-',
      title: `Lulus ${levelName}`,
      description: edu.asal_pendidikan,
      type: 'edu',
      icon: isSchool ? '🏫' : '🎓'
    })
  })

  // 2. Jabatan Jafung (Dosen)
  props.employee.riwayat_jafung?.forEach((jf: any) => {
    events.push({
      date: getYear(jf.tmt),
      title: `Jabatan Akademik`,
      description: jf.id_jafung == 1 ? 'Asisten Ahli' : jf.id_jafung == 2 ? 'Lektor' : jf.id_jafung == 3 ? 'Lektor Kepala' : jf.id_jafung == 4 ? 'Guru Besar' : 'Jabatan Akademik',
      type: 'career',
      icon: '🏛️'
    })
  })

  // 4. Sertifikasi (Serdos)
  props.employee.riwayat_sertifikasi?.forEach((cert: any) => {
    events.push({
      date: cert.tahun || '-',
      title: `Sertifikasi Profesional`,
      description: cert.jenis_sertifikasi,
      type: 'cert',
      icon: '🛡️'
    })
  })

  return events.sort((a, b) => {
    const yearA = isNaN(Number(a.date)) ? 0 : Number(a.date)
    const yearB = isNaN(Number(b.date)) ? 0 : Number(b.date)
    return yearB - yearA
  })
})

// --- LOGIC: RADAR CHART DATA ---
const radarMetrics = computed(() => {
  const isDosen = props.employee.ikatan_kerja == '1' || props.employee.type === 'dosen'
  if (isDosen) {
    const eduScore = Math.min(100, (props.employee.riwayat_pendidikan?.length || 0) * 20)
    const jafungScore = Math.min(100, (parseInt(props.employee.current_jafung || '0')) * 25)
    
    return [
      { label: 'Pendidikan', val: eduScore || 30 },
      { label: 'Akademik', val: jafungScore || 20 },
      { label: 'Sertifikasi', val: props.employee.riwayat_sertifikasi?.length ? 100 : 20 },
      { label: 'Penelitian', val: 50 },
      { label: 'Pengabdian', val: 60 }
    ]
  } else {
    // For Tendik, ensure we don't have 0 in all cases to avoid weird radar
    const trainingScore = (props.employee.riwayat_pelatihan?.length || 0) * 20
    return [
      { label: 'Pelatihan', val: trainingScore || 15 },
      { label: 'Jabatan', val: 60 },
      { label: 'Layanan', val: 80 },
      { label: 'Sertifikasi', val: 40 },
      { label: 'Lama Kerja', val: 90 }
    ]
  }
})

// Generate SVG points for the radar
const radarPoints = computed(() => {
  const centerX = 100, centerY = 100, radius = 80
  const total = radarMetrics.value.length
  return radarMetrics.value.map((m, i) => {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2
    const val = isNaN(m.val) ? 10 : Math.max(10, m.val)
    const distance = (val / 100) * radius
    const x = centerX + distance * Math.cos(angle)
    const y = centerY + distance * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')
})

const hasIncompleteData = computed(() => {
  return timelineEvents.value.length === 0 && (!props.employee.riwayat_pendidikan || props.employee.riwayat_pendidikan.length === 0)
})

const aiRecommendations = computed(() => {
  const recs = []
  const e = props.employee
  const isDosen = e.type === 'dosen' || e.ikatan_kerja == '1'

  if (isDosen) {
    // 1. Education Progression Logic
    const highestEdu = e.riwayat_pendidikan?.reduce((max: number, p: any) => Math.max(max, parseInt(p.id_pendidikan)), 0) || 0
    
    if (highestEdu < 5) { // Below S2
      recs.push({
        title: 'Akademik: Studi Lanjut S2',
        text: 'Untuk memenuhi syarat homebase NIDN dan kualifikasi dosen tetap, sangat disarankan untuk segera melanjutkan studi ke jenjang S2 (Magister).',
        priority: 'urgent'
      })
    } else if (highestEdu < 6) { // S2 but not S3
      recs.push({
        title: 'Akademik: Studi Lanjut S3',
        text: 'Sebagai pemegang gelar S2, Anda disarankan mulai merencanakan studi Doktoral (S3) untuk memperkuat portofolio akademik dan syarat Lektor Kepala/Guru Besar.',
        priority: 'high'
      })
    }

    // 2. Certification (Serdos) Logic - Only for S2+
    const hasSerdos = e.riwayat_sertifikasi?.length > 0
    if (!hasSerdos && highestEdu >= 5) {
      recs.push({
        title: 'Profesional: Persiapan Serdos',
        text: 'Kualifikasi pendidikan S2 telah terpenuhi. Fokus pada pengumpulan angka kredit (KUM) dan pengabdian masyarakat untuk pengusulan Serdos.',
        priority: 'urgent'
      })
    } else if (!hasSerdos && highestEdu < 5) {
      recs.push({
        title: 'Profesional: Syarat Serdos',
        text: 'Penyelesaian studi S2 adalah syarat utama Serdos. Fokus pada kelulusan S2 untuk membuka jalur sertifikasi dosen.',
        priority: 'medium'
      })
    }

    // 3. Jafung Progression Logic
    const currentJf = parseInt(e.current_jafung || '0')
    if (currentJf === 0) {
      recs.push({
        title: 'Karir: Pengusulan Jafung Pertama',
        text: 'Segera siapkan berkas pengusulan Asisten Ahli (AA) untuk meresmikan jenjang karir akademik Anda.',
        priority: 'high'
      })
    } else if (currentJf === 1) { // Asisten Ahli
      recs.push({
        title: 'Karir: Target Lektor',
        text: 'Setelah masa kerja mencukupi, persiapkan publikasi jurnal ilmiah untuk kenaikan jabatan akademik ke jenjang Lektor.',
        priority: 'medium'
      })
    } else if (currentJf === 2) { // Lektor
       recs.push({
        title: 'Karir: Target Lektor Kepala',
        text: 'Jenjang Lektor Kepala membutuhkan publikasi di jurnal terakreditasi SINTA 2 atau Internasional Bereputasi. Mulai susun roadmap penelitian Anda.',
        priority: 'high'
      })
    }
  } else {
    // Tendik Recommendations
    const hasTrainingRecent = e.riwayat_pelatihan?.length > 2
    if (!hasTrainingRecent) {
      recs.push({
        title: 'Kompetensi: Diklat Teknis',
        text: 'Disarankan mengikuti pelatihan peningkatan kompetensi administrasi digital atau pelayanan prima untuk menunjang performa unit kerja.',
        priority: 'medium'
      })
    }
  }

  // Default if list is empty
  if (recs.length === 0) {
    recs.push({
      title: 'Karir Stabil & Optimal',
      text: 'Pertahankan kinerja dan kontribusi aktif dalam tridharma perguruan tinggi. Fokus pada pemeliharaan data publikasi setiap semester.',
      priority: 'low'
    })
  }

  return recs
})
</script>

<template>
  <div class="intelligence-section">
    <!-- INCOMPLETE DATA OVERLAY -->
    <div v-if="hasIncompleteData" class="incomplete-notice">
      <div class="notice-content">
        <div class="notice-icon">✨</div>
        <h3>Analisis Intelligence Sedang Diproses</h3>
        <p>Data riwayat karir dan pendidikan sedang dalam tahap sinkronisasi atau belum lengkap di database.</p>
        <div class="notice-tips">
          <span>Saran: Lengkapi Riwayat Pendidikan & Pelatihan untuk visualisasi radar.</span>
        </div>
      </div>
    </div>

    <div class="intel-grid" :class="{ 'blur-bg': hasIncompleteData }">
      <!-- LEFT: COMPETENCY RADAR -->
      <div class="glass-card panel-radar">
        <div class="p-header">
          <h3>Profil Kompetensi Strategis</h3>
          <p>Visualisasi kekuatan personil berdasarkan data riwayat</p>
        </div>
        
        <div class="radar-container">
          <svg viewBox="0 0 200 200" class="radar-svg">
            <circle cx="100" cy="100" r="20" class="radar-ring" />
            <circle cx="100" cy="100" r="40" class="radar-ring" />
            <circle cx="100" cy="100" r="60" class="radar-ring" />
            <circle cx="100" cy="100" r="80" class="radar-ring" />
            
            <line v-for="(m, i) in radarMetrics" :key="'l'+i"
              x1="100" y1="100"
              :x2="100 + 85 * Math.cos((Math.PI * 2 * i) / radarMetrics.length - Math.PI / 2)"
              :y2="100 + 85 * Math.sin((Math.PI * 2 * i) / radarMetrics.length - Math.PI / 2)"
              class="radar-axis"
            />

            <polygon :points="radarPoints" class="radar-area" />
            
            <text v-for="(m, i) in radarMetrics" :key="'t'+i"
              :x="100 + 95 * Math.cos((Math.PI * 2 * i) / radarMetrics.length - Math.PI / 2)"
              :y="100 + 95 * Math.sin((Math.PI * 2 * i) / radarMetrics.length - Math.PI / 2)"
              text-anchor="middle"
              class="radar-label"
            >
              {{ m.label }}
            </text>
          </svg>
        </div>
      </div>

      <!-- RIGHT: CAREER TIMELINE & RECS -->
      <div class="intel-right">
        <!-- AI RECOMMENDATIONS BLOCK -->
        <div class="glass-card panel-recs mb-8">
          <div class="p-header left">
            <h3><span class="ai-sparkle">✨</span> Rekomendasi Strategis AI</h3>
          </div>
          <div class="recs-list">
            <div v-for="(rec, idx) in aiRecommendations" :key="idx" class="rec-card" :class="rec.priority">
              <div class="rec-icon">💡</div>
              <div class="rec-body">
                <h5>{{ rec.title }}</h5>
                <p>{{ rec.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card panel-timeline">
          <div class="p-header">
            <h3>Alur Lini Masa Karir</h3>
            <p>Rekam jejak professional sepanjang masa bakti</p>
          </div>

          <div class="timeline-scroll">
            <div v-for="(event, idx) in timelineEvents" :key="idx" class="timeline-item">
              <div class="t-date">
                <span class="year">{{ event.date }}</span>
                <div class="dot-wrapper">
                  <div :class="['dot', event.type]"></div>
                  <div class="line"></div>
                </div>
              </div>
              <div class="t-content">
                <div class="t-icon">{{ event.icon }}</div>
                <div class="t-text">
                  <h4>{{ event.title }}</h4>
                  <p>{{ event.description }}</p>
                </div>
              </div>
            </div>
            <div v-if="timelineEvents.length === 0" class="empty-state">
              Belum ada riwayat karir tercatat
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.intelligence-section { padding: 1rem; }
.intel-grid { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 2rem; }
.intel-right { display: flex; flex-direction: column; gap: 2rem; }

.panel-radar, .panel-timeline, .panel-recs { padding: 2.5rem; border-radius: 24px; min-height: fit-content; display: flex; flex-direction: column; }
.panel-radar { align-items: center; min-height: 500px; }
.panel-recs { background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(255, 255, 255, 0.05)); border: 1px solid rgba(99, 102, 241, 0.2); }

.p-header { margin-bottom: 2.5rem; text-align: center; }
.p-header.left { text-align: left; margin-bottom: 1.5rem; }
.p-header h3 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem; }
.p-header p { font-size: 0.85rem; color: #64748b; }

/* Radar Chart */
.radar-container { width: 100%; max-width: 350px; position: relative; }
.radar-svg { overflow: visible; }
.radar-ring { fill: none; stroke: rgba(99, 102, 241, 0.08); stroke-width: 1; }
.radar-axis { stroke: rgba(99, 102, 241, 0.15); stroke-width: 1; stroke-dasharray: 4; }
.radar-area { fill: rgba(99, 102, 241, 0.2); stroke: #6366f1; stroke-width: 3; stroke-linejoin: round; }
.radar-label { font-size: 8px; font-weight: 800; fill: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

/* Timeline */
.timeline-scroll { flex: 1; overflow-y: auto; padding-right: 1.5rem; }
.timeline-item { display: flex; gap: 2rem; margin-bottom: 2.5rem; position: relative; }
.t-date { display: flex; flex-direction: column; align-items: center; min-width: 60px; }
.t-date .year { font-weight: 900; font-size: 1rem; color: #1e293b; font-family: 'JetBrains Mono', monospace; }

.dot-wrapper { display: flex; flex-direction: column; align-items: center; flex: 1; margin-top: 1rem; }
.dot { width: 14px; height: 14px; border-radius: 50%; z-index: 2; border: 3px solid #fff; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
.dot.edu { background: #6366f1; box-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
.dot.career { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
.dot.struct { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
.dot.cert { background: #ec4899; box-shadow: 0 0 10px rgba(236, 72, 153, 0.5); }

.timeline-item .line { width: 2px; flex: 1; background: #f1f5f9; margin-top: 5px; margin-bottom: -30px; }
.timeline-item:last-child .line { display: none; }

.t-content { 
  display: flex; 
  align-items: center; 
  gap: 1.25rem; 
  background: #f8fafc; 
  padding: 1.25rem 1.75rem; 
  border-radius: 18px; 
  flex: 1; 
  border: 1px solid #f1f5f9;
  transition: all 0.3s;
}
.t-content:hover { transform: translateX(5px); background: #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.03); border-color: #6366f1; }
.t-icon { font-size: 1.5rem; }
.t-text h4 { font-size: 0.95rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; }
.t-text p { font-size: 0.8rem; color: #64748b; font-weight: 600; }

/* RECS STYLES */
.ai-sparkle { color: #f59e0b; }
.recs-list { display: flex; flex-direction: column; gap: 1rem; }
.rec-card { display: flex; gap: 1rem; padding: 1.25rem; border-radius: 16px; background: rgba(255,255,255,0.4); border-left: 4px solid #e2e8f0; }
.rec-card.urgent { border-left-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
.rec-card.high { border-left-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
.rec-card.medium { border-left-color: #6366f1; background: rgba(99, 102, 241, 0.05); }
.rec-icon { font-size: 1.2rem; }
.rec-body h5 { margin: 0 0 0.25rem; font-size: 0.85rem; font-weight: 800; color: #1e293b; }
.rec-body p { margin: 0; font-size: 0.8rem; color: #64748b; line-height: 1.4; font-weight: 500; }

/* INCOMPLETE DATA UI */
.incomplete-notice {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  width: 100%;
  max-width: 500px;
  text-align: center;
}
.notice-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 3rem;
  border-radius: 30px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
}
.notice-icon { font-size: 3.5rem; margin-bottom: 1.5rem; animation: pulse-glass 2s infinite; }
.notice-content h3 { font-size: 1.4rem; font-weight: 900; color: #1e293b; margin-bottom: 1rem; }
.notice-content p { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }
.notice-tips { background: #f8fafc; padding: 1rem; border-radius: 12px; font-size: 0.8rem; color: #6366f1; font-weight: 700; }

.blur-bg { filter: blur(8px); pointer-events: none; opacity: 0.4; }

@keyframes pulse-glass {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

.timeline-scroll::-webkit-scrollbar { width: 4px; }
.timeline-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
</style>
