<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  employee: any
}>()

const checks = computed(() => {
  const e = props.employee
  const results = [
    { label: 'NIDN/NIDK', status: !!e.nidn },
    { label: 'KTP (ID Card)', status: !!e.nomor_ktp },
    { label: 'File KTP', status: !!e.upload_ktp },
    { label: 'Nama Ibu Kandung', status: !!e.nama_ibu_kandung },
    { label: 'Riwayat Jafung', status: (e.riwayat_jafung && e.riwayat_jafung.length > 0) },
    { label: 'Pendidikan S2/S3', status: (e.riwayat_pendidikan && e.riwayat_pendidikan.some((p: any) => [4, 5, 6].includes(p.id_pendidikan))) }
  ]
  return results
})

const score = computed(() => {
  const passed = checks.value.filter(c => c.status).length
  return Math.round((passed / checks.value.length) * 100)
})

const getStatusColor = (s: number) => {
  if (s < 50) return '#ef4444' // Red
  if (s < 100) return '#f59e0b' // Amber
  return '#10b981' // Green
}
</script>

<template>
  <div class="sister-integrity glass-card mb-12">
    <div class="header-integrity">
      <div class="title-info">
        <h3>Sister PDDikti Integrity</h3>
        <p class="text-muted text-xs">Kesiapan sinkronisasi data ke aplikasi Sister</p>
      </div>
      <div class="score-circle" :style="{ borderColor: getStatusColor(score) }">
        <span class="score-val">{{ score }}<small>%</small></span>
      </div>
    </div>

    <div class="integrity-bar-container">
      <div class="integrity-bar">
        <div class="integrity-progress" :style="{ width: score + '%', background: getStatusColor(score) }"></div>
      </div>
    </div>

    <div class="checks-grid">
      <div v-for="check in checks" :key="check.label" class="check-item">
        <span :class="['dot', { active: check.status }]"></span>
        <span class="label">{{ check.label }}</span>
        <span class="status-icon">{{ check.status ? '✨' : '❌' }}</span>
      </div>
    </div>

    <div v-if="score < 100" class="warning-box">
      ⚠️ Data belum siap lapor PDDikti. Mohon lengkapi item bertanda ❌.
    </div>
    <div v-else class="success-box">
      ✅ Data siap sinkronisasi ke aplikasi Sister!
    </div>
  </div>
</template>

<style scoped>
.sister-integrity { 
  border: 1px solid var(--glass-border); 
  padding: 2.5rem 3rem;
}
.header-integrity { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
h3 { font-size: 1.25rem; font-weight: 900; margin-bottom: 0.5rem; color: #1e293b; }

.score-circle {
  width: 60px;
  height: 60px;
  border: 5px solid;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.score-val { font-size: 1.15rem; font-weight: 900; color: #1e293b; }

.integrity-bar-container { height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; margin-bottom: 2rem; border: 1px solid #e2e8f0; }
.integrity-progress { height: 100%; transition: width 1s ease-in-out; }

.checks-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.check-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; background: white; padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--glass-border); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.status-icon { margin-left: auto; font-size: 1rem; }
.label { font-weight: 700; color: #475569; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; }
.dot.active { background: #10b981; }

.warning-box { margin-top: 2rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 0.75rem; border-radius: 8px; font-size: 0.8rem; text-align: center; font-weight: 600; }
.success-box { margin-top: 2rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.75rem; border-radius: 8px; font-size: 0.8rem; text-align: center; font-weight: 600; }
</style>
