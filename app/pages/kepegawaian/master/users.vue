<script setup lang="ts">
const { data: users, refresh } = await useFetch('/api/kepegawaian/master/users')
const { data: biros } = await useFetch('/api/kepegawaian/biro')

const showModal = ref(false)
const isEditing = ref(false)
const form = ref({
  id: null,
  username: '',
  password: '',
  email: '',
  first_name: '',
  last_name: '',
  company: '',
  role: 'prodi',
  active: 1
})

const openAdd = () => {
  isEditing.ref = false
  form.value = { id: null, username: '', password: '', email: '', first_name: '', last_name: '', company: '', role: 'prodi', active: 1 }
  showModal.value = true
}

const handleSave = async () => {
  const method = form.value.id ? 'PUT' : 'POST'
  const res = await $fetch('/api/kepegawaian/master/users', {
    method,
    body: form.value
  })
  if (res.success) {
    showModal.value = false
    refresh()
  } else {
    alert(res.message)
  }
}

const deleteUser = async (id: number) => {
  if (confirm('Hapus user ini?')) {
    await $fetch(`/api/kepegawaian/master/users?id=${id}`, { method: 'DELETE' })
    refresh()
  }
}
</script>

<template>
  <div class="user-mgmt">
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Manajemen User</h1>
        <p class="text-slate-500 mt-1">Kelola akun akses Sistem Informasi Kepegawaian</p>
      </div>
      <button @click="openAdd" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Tambah User Baru
      </button>
    </div>

    <div class="glass-card mt-8 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50/50">
            <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">User</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Role</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Unit/Unit Kerja</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
            <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="u in users?.data" :key="u.id" class="hover:bg-slate-50/30 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {{ u.first_name[0] }}
                </div>
                <div>
                  <div class="font-bold text-slate-800">{{ u.first_name }} {{ u.last_name }}</div>
                  <div class="text-xs text-slate-400">{{ u.username }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm font-medium text-slate-600">{{ u.role }}</td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ u.unit_code || '-' }}</td>
            <td class="px-6 py-4">
              <span :class="['status-badge', u.active ? 'active' : 'inactive']">
                {{ u.active ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="deleteUser(u.id)" class="text-red-500 hover:text-red-700 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal User -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content glass-card max-w-lg w-full">
        <h2 class="text-xl font-bold mb-6">Tambah User Baru</h2>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <input v-model="form.first_name" placeholder="Nama Depan" class="form-input" />
            <input v-model="form.last_name" placeholder="Nama Belakang" class="form-input" />
          </div>
          <input v-model="form.username" placeholder="Username" class="form-input" />
          <input v-model="form.password" type="password" placeholder="Password" class="form-input" />
          <input v-model="form.email" type="email" placeholder="Email" class="form-input" />
          
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-400">Unit Kerja (Prodi/Fakultas)</label>
            <select v-model="form.company" class="form-input">
              <option value="">-- Pilih Unit --</option>
              <option v-for="b in biros?.data" :key="b.id" :value="b.id">{{ b.nama }}</option>
            </select>
          </div>

          <div class="flex gap-4 pt-4">
            <button @click="showModal = false" class="btn-ghost flex-1">Batal</button>
            <button @click="handleSave" class="btn-primary flex-1">Simpan User</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; }
.btn-primary { background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
.btn-ghost { background: #f1f5f9; color: #64748b; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; }
.form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 0.9rem; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #fee2e2; color: #991b1b; }
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); display: flex; items-center: center; justify-content: center; z-index: 1000; padding: 2rem; }
.modal-content { padding: 2.5rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
</style>
