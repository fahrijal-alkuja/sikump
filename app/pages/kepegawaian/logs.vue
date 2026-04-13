<script setup lang="ts">
const { data: logsData } = await useFetch('/api/kepegawaian/logs')
const logs = computed<any[]>(() => {
  const d = logsData.value as any
  return d?.success ? d.data : []
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="logs-page">
    <div class="page-header">
      <div>
        <h1>Audit Log Aktivitas</h1>
        <p class="subtitle">Rekamanan jejak administratif pengelolaan SDM</p>
      </div>
    </div>

    <div class="glass-card table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Operator</th>
            <th>Aksi</th>
            <th>Target NIK</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td class="time-cell">{{ formatDate(log.created_at) }}</td>
            <td class="operator-cell">
              <span class="op-name">{{ log.nama_operator }}</span>
              <span class="op-nik">{{ log.nik_operator }}</span>
            </td>
            <td><span class="action-badge">{{ log.aksi }}</span></td>
            <td class="nik-cell">{{ log.target_nik }}</td>
            <td class="detail-cell">{{ log.detail }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="logs.length === 0" class="empty-state">Belum ada aktivitas terekam.</div>
    </div>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 2rem; }
h1 { font-size: 2rem; font-weight: 800; }
.subtitle { color: var(--text-muted); }

.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th { text-align: left; padding: 1.2rem; color: var(--text-muted); border-bottom: 1px solid var(--glass-border); font-size: 0.75rem; text-transform: uppercase; }
.premium-table td { padding: 1.2rem; border-bottom: 1px solid var(--glass-border); font-size: 0.9rem; }

.time-cell { color: var(--text-muted); font-size: 0.8rem; }
.operator-cell { display: flex; flex-direction: column; }
.op-name { font-weight: 700; color: var(--primary); }
.op-nik { font-size: 0.75rem; color: var(--text-muted); }

.action-badge { background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
.nik-cell { font-family: monospace; }
.detail-cell { color: var(--text-muted); max-width: 300px; }

.empty-state { padding: 5rem; text-align: center; color: var(--text-muted); }
</style>
