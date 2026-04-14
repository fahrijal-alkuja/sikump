<script setup lang="ts">
import { ref, computed } from 'vue'

const { data: filesData, refresh } = await useFetch('/api/kepegawaian/files')
const search = ref('')
const selectedCategory = ref('Semua')

const categories = computed<string[]>(() => {
  const d = filesData.value as any
  if (!d?.success) return ['Semua']
  const unique = [...new Set(d.data.map((f: any) => f.category))] as string[]
  return ['Semua', ...unique.filter(Boolean)]
})

const files = computed<any[]>(() => {
  const d = filesData.value as any
  if (!d?.success) return []
  
  return d.data.filter((f: any) => {
    const matchesSearch = 
      f.file_name?.toLowerCase().includes(search.value.toLowerCase()) ||
      f.owner_name?.toLowerCase().includes(search.value.toLowerCase()) ||
      f.category?.toLowerCase().includes(search.value.toLowerCase())
    
    const matchesCategory = selectedCategory.value === 'Semua' || f.category === selectedCategory.value
    
    return matchesSearch && matchesCategory
  })
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
    <div class="page-header header-premium">
      <div class="title-section">
        <div class="icon-dossier">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div>
          <h1>Digital Dossier</h1>
          <p class="subtitle">Arsip dokumen digital terintegrasi SI-KUMP</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="header-tools">
          <div class="search-box">
            <span class="search-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>
            <input v-model="search" type="text" placeholder="Cari berkas, pemilik, atau kategori..." class="glass-input" />
          </div>
          <div class="category-chips scrollbar-hide">
            <button 
              v-for="cat in categories" 
              :key="cat"
              @click="selectedCategory = cat"
              :class="['chip', { active: selectedCategory === cat }]"
            >
              {{ cat }}
            </button>
          </div>
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
        <div class="empty-visual">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="9" y1="14" x2="15" y2="14"></line></svg>
        </div>
        <h3>Dossier Kosong</h3>
        <p>Belum ada berkas digital yang terdeteksi di sistem.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.berkas-page { 
  padding: 2rem; 
  min-height: 100vh; 
  box-sizing: border-box;
}
.page-header { 
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center; 
  padding: 1.5rem 2.5rem !important; 
  margin-bottom: 3rem; 
  border-radius: 1.5rem;
  background: white;
  box-shadow: 0 15px 35px rgba(0,0,0,0.05);
  box-sizing: border-box !important;
  width: auto;
}

.title-section { display: flex; align-items: center; gap: 1.5rem; }
.icon-dossier { width: 48px; height: 48px; color: var(--primary); }
.icon-dossier svg { width: 100%; height: 100%; }
h1 { font-size: 1.8rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 0.1rem; color: #1e293b; }
.subtitle { color: var(--text-muted); font-size: 0.95rem; }

.header-actions {
  display: flex;
  justify-content: flex-end;
  min-width: 0;
  margin-left: 2rem;
  max-width: 500px;
}

.header-tools {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-chips {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.chip {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.chip:hover {
  background: white;
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}

.chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
}

.search-box { 
  position: relative; 
  width: 100%;
  max-width: 350px;
}
.search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; opacity: 0.5; color: var(--primary); }
.search-icon svg { width: 100%; height: 100%; }
.glass-input { 
  background: #f1f5f9; 
  border: 1px solid #e2e8f0; 
  color: #1e293b; 
  padding: 0.8rem 1rem 0.8rem 2.8rem; 
  border-radius: 12px; 
  width: 100%; 
  outline: none;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.glass-input:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }

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
.empty-visual { width: 120px; height: 120px; margin: 0 auto 2rem; color: var(--primary); }
.empty-visual svg { width: 100%; height: 100%; }
.empty-state-lux h3 { font-size: 2rem; color: #fff; margin-bottom: 0.5rem; }
.empty-state-lux p { color: var(--text-muted); }
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  .search-box {
    width: 100%;
  }
}
</style>
