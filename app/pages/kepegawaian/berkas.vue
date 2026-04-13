<script setup lang="ts">
import { ref, computed } from 'vue'

const { data: filesData, refresh } = await useFetch('/api/kepegawaian/files')
const search = ref('')

const files = computed<any[]>(() => {
  const d = filesData.value as any
  if (!d?.success) return []
  return d.data.filter((f: any) => 
    f.file_name?.toLowerCase().includes(search.value.toLowerCase()) ||
    f.owner_name?.toLowerCase().includes(search.value.toLowerCase()) ||
    f.category?.toLowerCase().includes(search.value.toLowerCase())
  )
})

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return '📄'
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '🖼️'
  return '📁'
}
</script>

<template>
  <div class="berkas-page scrollbar-hide">
    <div class="page-header glass-card">
      <div class="title-section">
        <div class="icon-dossier">📂</div>
        <div>
          <h1>Digital Dossier</h1>
          <p class="subtitle">Arsip dokumen digital terintegrasi SI-KUMP</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="search" type="text" placeholder="Cari berkas, pemilik, atau kategori..." class="glass-input" />
        </div>
      </div>
    </div>

    <div class="file-grid">
      <div v-for="(file, idx) in files" :key="idx" class="glass-card file-card-premium">
        <div class="card-overlay"></div>
        <div class="file-category-badge">{{ file.category }}</div>
        
        <div class="file-visual">
          <div class="visual-icon">{{ getFileIcon(file.file_name) }}</div>
        </div>

        <div class="file-details">
          <h4 class="f-name-premium text-truncate" :title="file.file_name">{{ file.file_name }}</h4>
          <p class="f-owner-premium">
            <span class="owner-name">{{ file.owner_name }}</span>
          </p>
        </div>

        <div class="file-action-footer">
          <a :href="`/assets/${file.folder}/${file.file_name}`" target="_blank" class="btn-action-view">
             Buka Dokumen
          </a>
        </div>
      </div>

      <div v-if="files.length === 0" class="empty-state-lux">
        <div class="empty-visual">🕳️</div>
        <h3>Dossier Kosong</h3>
        <p>Belum ada berkas digital yang terdeteksi di sistem.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.berkas-page { padding: 2.5rem; min-height: 100vh; }
.page-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 2rem 3rem; 
  margin-bottom: 3rem; 
  border-radius: 2rem;
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
}

.title-section { display: flex; align-items: center; gap: 1.5rem; }
.icon-dossier { font-size: 3rem; }
h1 { font-size: 2.2rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 0.2rem; }
.subtitle { color: var(--text-muted); font-size: 0.95rem; }

.search-box { position: relative; width: 350px; }
.search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); opacity: 0.5; }
.glass-input { 
  background: rgba(255,255,255,0.05); 
  border: 1px solid var(--glass-border); 
  color: white; 
  padding: 0.8rem 1rem 0.8rem 2.8rem; 
  border-radius: 12px; 
  width: 100%; 
  outline: none;
  transition: all 0.2s;
}
.glass-input:focus { background: rgba(255,255,255,0.1); border-color: var(--primary); }

.file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }

.file-card-premium {
  position: relative;
  padding: 2rem;
  border-radius: 1.5rem;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.file-card-premium:hover {
  transform: translateY(-10px);
  background: rgba(255,255,255,0.05);
  border-color: var(--primary);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4);
}

.file-category-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary);
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  z-index: 2;
}

.file-visual {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.visual-icon { font-size: 4rem; transition: transform 0.3s; }
.file-card-premium:hover .visual-icon { transform: scale(1.1) rotate(-5deg); }

.file-details { margin-bottom: 1.5rem; }
.f-name-premium { font-size: 1rem; font-weight: 800; margin-bottom: 0.5rem; color: #fff; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.f-owner-premium { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
.owner-name { color: var(--primary); font-weight: 700; }

.btn-action-view {
  display: block;
  text-align: center;
  background: rgba(255,255,255,0.05);
  color: white;
  text-decoration: none;
  padding: 0.8rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.3s;
  border: 1px solid rgba(255,255,255,0.1);
}

.file-card-premium:hover .btn-action-view {
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 8px 15px rgba(99, 102, 241, 0.3);
}

.empty-state-lux {
  grid-column: 1 / -1;
  padding: 8rem 0;
  text-align: center;
}
.empty-visual { font-size: 5rem; margin-bottom: 1rem; opacity: 0.3; }
.empty-state-lux h3 { font-size: 2rem; color: #fff; margin-bottom: 0.5rem; }
.empty-state-lux p { color: var(--text-muted); }
</style>
