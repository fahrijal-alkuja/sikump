<script setup lang="ts">
const props = defineProps<{
  show: boolean
  title: string
  fileUrl: string
}>()

const emit = defineEmits(['close'])

const isImage = computed(() => {
  const ext = props.fileUrl.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')
})

const isPdf = computed(() => {
  return props.fileUrl.toLowerCase().endsWith('.pdf')
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="emit('close')">
      <div class="modal-card glass-card" @click.stop>
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="btn-close" @click="emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="isImage" class="preview-container">
            <img :src="fileUrl" alt="Preview" class="full-preview" />
          </div>
          <div v-else-if="isPdf" class="preview-container relative">
            <iframe :src="fileUrl" class="pdf-frame"></iframe>
            <div class="pdf-fallback">
               <p>Jika dokumen tidak muncul, silakan klik tombol di bawah:</p>
               <a :href="fileUrl" target="_blank" class="btn-fallback">Buka Dokumen di Tab Baru</a>
            </div>
          </div>
          <div v-else class="unsupported">
             <p>File ini tidak mendukung preview langsung.</p>
             <a :href="fileUrl" download class="btn-primary">Download File</a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-card {
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 1.5rem;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.preview-container {
  width: 100%;
  height: 70vh;
  display: flex;
  justify-content: center;
}

.full-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
  position: relative;
  z-index: 2;
  background: white;
}

.pdf-fallback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
  width: 80%;
}

.btn-fallback {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: #1e293b;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.unsupported {
  text-align: center;
  padding: 3rem;
}
</style>
