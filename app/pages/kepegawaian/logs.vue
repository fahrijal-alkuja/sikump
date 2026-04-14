<script setup lang="ts">
const { data: logsData, refresh } = await useFetch<any>('/api/kepegawaian/logs')
const logs = computed(() => logsData.value?.success ? logsData.value.data : [])

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

const getActionColor = (aksi: string) => {
  if (aksi.includes('CREATE')) return 'action-create'
  if (aksi.includes('UPDATE')) return 'action-update'
  if (aksi.includes('DELETE')) return 'action-delete'
  return 'action-default'
}
</script>

<template>
  <div class="logs-elite-wrapper">
    <!-- Header -->
    <div class="logs-header-bar">
      <div class="header-left">
        <h1 class="logs-main-title">Audit Log Aktivitas</h1>
        <p class="logs-sub-desc">Rekaman Jejak Administratif & Keamanan Sistem</p>
      </div>
      <button @click="refresh" class="btn-refresh-logs" title="Refresh Data">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
        Segarkan Log
      </button>
    </div>

    <!-- Log List -->
    <div class="logs-container glass-card">
      <table class="logs-table">
        <thead>
          <tr>
            <th style="width: 20%">Waktu Kejadian</th>
            <th style="width: 20%">Operator</th>
            <th style="width: 15%">Aksi</th>
            <th style="width: 15%">Target Identitas</th>
            <th style="width: 30%">Detail Aktivitas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="log-row">
            <td class="time-cell">
              <div class="time-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>{{ formatDate(log.created_at) }}</span>
              </div>
            </td>
            <td>
              <div class="operator-meta">
                <div class="op-avatar">{{ log.nama_operator ? log.nama_operator[0] : 'A' }}</div>
                <div class="op-info">
                  <span class="op-name">{{ log.nama_operator }}</span>
                  <span class="op-nik">ID: {{ log.nik_operator }}</span>
                </div>
              </div>
            </td>
            <td>
              <span :class="['action-chip', getActionColor(log.aksi)]">{{ log.aksi }}</span>
            </td>
            <td>
              <div class="target-box">
                <span class="target-nik">@{{ log.target_nik }}</span>
              </div>
            </td>
            <td class="detail-cell">
              <p class="detail-text">{{ log.detail }}</p>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Empty State -->
      <div v-if="logs.length === 0" class="logs-empty-state">
        <div class="empty-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <h3>Belum Ada Jejak Aktivitas</h3>
        <p>Seluruh aksi administratif akan secara otomatis tercatat di sini.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logs-elite-wrapper { padding: 40px; min-height: 100vh; }

.logs-header-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
.logs-main-title { font-size: 32px; font-weight: 900; color: #1e293b; letter-spacing: -1.5px; margin: 0; line-height: 1; }
.logs-sub-desc { font-size: 14px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }

.btn-refresh-logs {
  background: white; color: #4f46e5; padding: 12px 24px; border-radius: 16px; border: 1px solid #eef2ff; font-weight: 800; font-size: 14px;
  display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}
.btn-refresh-logs svg { width: 16px; height: 16px; transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.btn-refresh-logs:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
.btn-refresh-logs:hover svg { transform: rotate(180deg); }

.logs-container { background: white; border-radius: 32px; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03); }
.logs-table { width: 100%; border-collapse: collapse; }
.logs-table thead th { padding: 20px; background: #f8fafc; color: #94a3b8; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; text-align: left; border-bottom: 1px solid #f1f5f9; }
.log-row td { padding: 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.log-row:hover { background: #fafafa; }

.time-box { display: flex; align-items: center; gap: 8px; color: #64748b; font-weight: 700; font-size: 13px; }
.time-box svg { width: 14px; height: 14px; color: #cbd5e1; }

.operator-meta { display: flex; align-items: center; gap: 12px; }
.op-avatar { width: 36px; height: 36px; background: #f1f5f9; color: #64748b; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; }
.op-name { display: block; font-size: 14px; font-weight: 800; color: #334155; }
.op-nik { display: block; font-size: 11px; color: #94a3b8; font-weight: 700; }

.action-chip { padding: 4px 12px; border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
.action-create { background: #ecfdf5; color: #10b981; }
.action-update { background: #eff6ff; color: #3b82f6; }
.action-delete { background: #fff1f2; color: #e11d48; }
.action-default { background: #f8fafc; color: #94a3b8; }

.target-nik { font-family: monospace; font-weight: 700; color: #64748b; background: #f8fafc; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
.detail-text { font-size: 13px; color: #64748b; line-height: 1.5; font-weight: 600; margin: 0; }

.logs-empty-state { padding: 80px 40px; text-align: center; }
.empty-icon-box { width: 70px; height: 70px; background: #f8fafc; border-radius: 24px; display: flex; align-items: center; justify-content: center; color: #cbd5e1; margin: 0 auto 20px; }
.empty-icon-box svg { width: 35px; height: 35px; }
.logs-empty-state h3 { font-size: 20px; font-weight: 900; color: #1e293b; letter-spacing: -0.5px; margin: 0; }
.logs-empty-state p { color: #94a3b8; font-weight: 600; margin-top: 8px; }
</style>
