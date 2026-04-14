<script setup lang="ts">
import { ref } from 'vue'
const { showAlert } = useAlert()
const props = defineProps<{
  nik: string
  taxData: any
  askesData: any
}>()

const emit = defineEmits(['refresh'])

const preview = ref({ show: false, url: '', title: '' })
const openPreview = (url: string, title: string) => {
  preview.value = { show: true, url, title }
}

const isEditingTax = ref(false)
const isEditingAskes = ref(false)

const taxForm = ref({
  nomor_npwp: props.taxData?.[0]?.nomor_npwp || '',
})

const askesForm = ref({
  no_askes: props.askesData?.[0]?.no_askes || '',
  nama_askes: props.askesData?.[0]?.nama_askes || '',
})

const taxFile = ref<HTMLInputElement | null>(null)
const askesFile = ref<HTMLInputElement | null>(null)
const loading = ref(false)

const handleTaxUpdate = async () => {
    loading.value = true
    try {
        const formData = new FormData()
        formData.append('nik', props.nik)
        formData.append('nomor_npwp', taxForm.value.nomor_npwp)
        const id = props.taxData?.[0]?.id
        const url = id ? `/api/kepegawaian/riwayat/tmst_pajak/${id}` : `/api/kepegawaian/riwayat/tmst_pajak`
        const method = id ? 'PUT' : 'POST'

        if (taxFile.value?.files?.[0]) formData.append('upload_npwp', taxFile.value.files[0])
        // @ts-ignore
        const res = await $fetch<any>(url, { method, body: formData })
        if (res.success) { 
          showAlert(`Data NPWP berhasil ${id ? 'diperbarui' : 'disimpan'}`, 'success')
          isEditingTax.value = false
          emit('refresh')
        }
    } finally { loading.value = false }
}

const handleAskesUpdate = async () => {
    loading.value = true
    try {
        const formData = new FormData()
        formData.append('nik', props.nik)
        formData.append('no_askes', askesForm.value.no_askes)
        formData.append('nama_askes', askesForm.value.nama_askes)
        const id = props.askesData?.[0]?.id
        const url = id ? `/api/kepegawaian/riwayat/tmst_askes/${id}` : `/api/kepegawaian/riwayat/tmst_askes`
        const method = id ? 'PUT' : 'POST'

        if (askesFile.value?.files?.[0]) formData.append('upload_askes', askesFile.value.files[0])
        // @ts-ignore
        const res = await $fetch<any>(url, { method, body: formData })
        if (res.success) { 
          showAlert(`Data Askes berhasil ${id ? 'diperbarui' : 'disimpan'}`, 'success')
          isEditingAskes.value = false
          emit('refresh')
        }
    } finally { loading.value = false }
}
</script>

<template>
  <div class="insurance-section">
    <KepegawaianDocumentPreview 
      :show="preview.show" 
      :title="preview.title" 
      :file-url="preview.url" 
      @close="preview.show = false" 
    />
    <!-- NPWP / Tax Section -->
    <div class="card-group glass-card">
      <div class="section-header">
        <h3>Informasi Pajak (NPWP)</h3>
        <button @click="isEditingTax = !isEditingTax" class="btn-edit-small">
          {{ isEditingTax ? 'Batal' : 'Edit' }}
        </button>
      </div>
      
      <div v-if="!isEditingTax" class="info-grid-simple">
        <div class="info-item">
          <label>Nomor NPWP</label>
          <span>{{ taxData?.[0]?.nomor_npwp || '-' }}</span>
        </div>
        <div class="info-item" v-if="taxData?.[0]?.upload_npwp">
          <label>Kartu NPWP</label>
          <button @click="openPreview(`/assets/npwp/${taxData[0].upload_npwp}`, 'Kartu NPWP')" class="btn-link-lux">Lihat Dokumen</button>
        </div>
      </div>
      
      <form v-else @submit.prevent="handleTaxUpdate" class="form-grid-simple">
        <input v-model="taxForm.nomor_npwp" type="text" placeholder="Nomor NPWP" class="glass-input" />
        <input type="file" ref="taxFile" class="glass-input" accept=".jpg,.jpeg,.png,.pdf" />
        <div class="form-footer">
          <button type="submit" :disabled="loading" class="btn-primary-lux">
            <span v-if="!loading">Simpan NPWP</span>
            <div v-else class="spinner-small"></div>
          </button>
        </div>
      </form>
    </div>

    <!-- Askes Section -->
    <div class="card-group glass-card">
      <div class="section-header">
        <h3>Asuransi Kesehatan (ASKES/BPJS)</h3>
        <button @click="isEditingAskes = !isEditingAskes" class="btn-edit-small">
          {{ isEditingAskes ? 'Batal' : 'Edit' }}
        </button>
      </div>

      <div v-if="!isEditingAskes" class="info-grid-simple">
        <div class="info-item">
          <label>Nomor Askes/BPJS</label>
          <span>{{ askesData?.[0]?.no_askes || '-' }}</span>
        </div>
        <div class="info-item">
          <label>Nama Asuransi</label>
          <span>{{ askesData?.[0]?.nama_askes || '-' }}</span>
        </div>
        <div class="info-item" v-if="askesData?.[0]?.upload_askes">
          <label>Kartu Asuransi</label>
          <button @click="openPreview(`/assets/askes/${askesData[0].upload_askes}`, 'Kartu Asuransi/BPJS')" class="btn-link-lux">Lihat Dokumen</button>
        </div>
      </div>

      <form v-else @submit.prevent="handleAskesUpdate" class="form-grid-simple">
        <input v-model="askesForm.no_askes" type="text" placeholder="Nomor Askes" class="glass-input" />
        <input v-model="askesForm.nama_askes" type="text" placeholder="Nama Asuransi" class="glass-input" />
        <input type="file" ref="askesFile" class="glass-input" accept=".jpg,.jpeg,.png,.pdf" />
        <div class="form-footer">
          <button type="submit" :disabled="loading" class="btn-primary-lux">
            <span v-if="!loading">Simpan Askes</span>
            <div v-else class="spinner-small"></div>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.insurance-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.card-group { padding: 1.5rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.btn-edit-small { background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: var(--text-main); padding: 0.3rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.info-grid-simple { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.form-grid-simple { display: grid; gap: 1rem; }
.form-footer { margin-top: 1rem; display: flex; justify-content: flex-end; }
.btn-link-lux {
  background: none;
  border: none;
  color: var(--primary);
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-align: left;
}
.info-item label { font-size: 0.75rem; color: var(--text-muted); display: block; }
</style>
